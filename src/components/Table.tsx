import React, { useState, useMemo, ReactNode } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import { toPersianDigits } from '../utils/utils';

interface Data {
  id: number | string;
}

export interface HeadCell<T> {
  id: keyof T;
  label: string;
  numeric: boolean;
  cell?: (row: T) => ReactNode;
}
export interface Action<T> {
  icon: React.ReactElement;
  tooltip: string;
  onClick: (row: T) => void;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<T>(order: Order, orderBy: keyof T): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface EnhancedTableHeadProps<T> {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  headCells: readonly HeadCell<T>[];
  hasActions?: boolean;
}

function EnhancedTableHead<T>(props: EnhancedTableHeadProps<T>) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells, hasActions } = props;
  const createSortHandler = (property: keyof T) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all items' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id as string}
            align={headCell.numeric ? 'left' : 'right'}
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' }, p: { xs: 1, sm: 2 } }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        {hasActions && <TableCell align="center" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, p: { xs: 1, sm: 2 } }}>عملیات</TableCell>}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  title: string;
  onDelete?: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, title, onDelete } = props;

  if (numSelected === 0 && !title) {
    return null;
  }
  
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => theme.palette.secondary.main,
          color: (theme) => theme.palette.secondary.contrastText,
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%', fontSize: { xs: '0.7rem', md: '0.875rem' } }} color="inherit" variant="subtitle1" component="div">
          {toPersianDigits(numSelected)} مورد انتخاب شده
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%', fontSize: { xs: '0.7rem', md: '1rem' } }} variant="h6" id="tableTitle" component="div">
          {title}
        </Typography>
      )}
      {numSelected > 0 && onDelete && (
        <Tooltip title="حذف">
          <IconButton onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

interface EnhancedMuiTableProps<T> {
  rows: readonly T[];
  headCells: readonly HeadCell<T>[];
  title: string;
  onDelete?: (selected: readonly (string | number)[]) => void;
  actions?: readonly Action<T>[];
}

export default function EnhancedMuiTable<T extends Data>({
  rows,
  headCells,
  title,
  onDelete,
  actions,
}: EnhancedMuiTableProps<T>) {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(headCells[0]?.id);
  const [selected, setSelected] = useState<readonly (string | number)[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string | number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly (string | number)[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(selected);
      setSelected([]);
    }
  };

  const isSelected = (id: string | number) => selected.indexOf(id) !== -1;
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [order, orderBy, page, rowsPerPage, rows]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, boxShadow: 'none' }}>
        <EnhancedTableToolbar numSelected={selected.length} title={title} onDelete={onDelete ? handleDelete : undefined} />
        <TableContainer>
          <Table aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy as string}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              headCells={headCells}
              hasActions={!!actions?.length}
            />
            <TableBody>
              {visibleRows.map((row) => {
                const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${row.id}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    {headCells.map((cell) => (
                      <TableCell key={cell.id as string} align={cell.numeric ? 'left' : 'right'}
                        sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, p: { xs: 1, sm: 2 } }}>
                        {cell.cell ? cell.cell(row) : row[cell.id] as ReactNode}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell align="center"
                        sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, p: { xs: 1, sm: 2 } }}>
                        {actions.map((action, i) => (
                          <Tooltip title={action.tooltip} key={i}>
                            <IconButton onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}>
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={headCells.length + 2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="تعداد در صفحه"
          labelDisplayedRows={({ from, to, count }) =>
            `${toPersianDigits(from)}–${toPersianDigits(to)} از ${toPersianDigits(
              count
            )}`
          }
        />
      </Paper>
    </Box>
  );
}