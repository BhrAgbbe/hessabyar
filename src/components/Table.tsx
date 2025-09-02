import React, { useState, useMemo, ReactNode } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Toolbar,
  Typography,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

import { toPersianDigits, formatJalaliDate } from "../utils/utils";

export interface Data {
  id: string | number;
}

export interface HeadCell<T> {
  id: keyof T;
  label: string;
  numeric: boolean;
  cell?: (row: T) => ReactNode;
  width?: string | number;
  align?: "center" | "left" | "right" | "justify";
}

export interface Action<T> {
  icon: React.ReactElement;
  tooltip: string;
  onClick: (row: T) => void;
}

type Order = "asc" | "desc";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const va = a[orderBy];
  const vb = b[orderBy];

  if (va == null || vb == null) return 0;
  if (va instanceof Date && vb instanceof Date) return vb.getTime() - va.getTime();
  if (typeof va === "number" && typeof vb === "number") return vb - va;
  const sa = String(va);
  const sb = String(vb);
  if (sb < sa) return -1;
  if (sb > sa) return 1;
  return 0;
}

function getComparator<T>(order: Order, orderBy: keyof T) {
  return order === "desc"
    ? (a: T, b: T) => descendingComparator(a, b, orderBy)
    : (a: T, b: T) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface EnhancedTableHeadProps<T> {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: keyof T | null;
  rowCount: number;
  headCells: readonly HeadCell<T>[];
  hasActions?: boolean;
}

function EnhancedTableHead<T extends Data>(props: EnhancedTableHeadProps<T>) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells, hasActions } = props;
  const createSortHandler = (property: keyof T) => (event: React.MouseEvent<unknown>) => onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="none" sx={{ width: 48, textAlign: "center" }}>
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={String(headCell.id)}
            align={headCell.align ?? "center"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              whiteSpace: "nowrap",
              fontSize: { xs: "0.7rem", md: "0.875rem" },
              p: { xs: 0.5, sm: 2 },
              width: headCell.width,
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        {hasActions && <TableCell align="center" sx={{ width: 90 }}>عملیات</TableCell>}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  title: string;
  onDelete?: () => void;
}

function EnhancedTableToolbar({ numSelected, title, onDelete }: EnhancedTableToolbarProps) {
  if (numSelected === 0 && !title) return null;

  return (
    <Toolbar
      sx={{
        pl: 2,
        pr: 1,
        ...(numSelected > 0 && {
          bgcolor: (theme) => theme.palette.secondary.main,
          color: (theme) => theme.palette.secondary.contrastText,
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: "1 1 100%", fontSize: { xs: "0.7rem", md: "0.875rem" } }} color="inherit">
          {toPersianDigits(numSelected)} مورد انتخاب شده
        </Typography>
      ) : (
        <Typography sx={{ flex: "1 1 100%", fontSize: { xs: "0.7rem", md: "0.875rem" } }}>{title}</Typography>
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

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions({ count, page, rowsPerPage, onPageChange }: TablePaginationActionsProps) {
  const theme = useTheme();
  const handleFirst = (e: React.MouseEvent<HTMLButtonElement>) => onPageChange(e, 0);
  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => onPageChange(e, page - 1);
  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => onPageChange(e, page + 1);
  const handleLast = (e: React.MouseEvent<HTMLButtonElement>) =>
    onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton onClick={handleFirst} disabled={page === 0}>
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBack} disabled={page === 0}>
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={handleNext} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton onClick={handleLast} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

interface EnhancedMuiTableProps<T extends Data> {
  rows: readonly T[];
  headCells: readonly HeadCell<T>[];
  title: string;
  onDelete?: (selected: readonly (string | number)[]) => void;
  actions?: readonly Action<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export default function EnhancedMuiTable<T extends Data>({
  rows,
  headCells,
  title,
  onDelete,
  actions,
  onRowClick,
  loading = false,
}: EnhancedMuiTableProps<T>) {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof T | null>(headCells.length ? headCells[0].id : null);
  const [selected, setSelected] = useState<readonly (string | number)[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof T) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) setSelected(rows.map((r) => r.id));
    else setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, id: string | number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly (string | number)[] = [];
    if (selectedIndex === -1) newSelected = selected.concat(id);
    else if (selectedIndex === 0) newSelected = selected.slice(1);
    else if (selectedIndex === selected.length - 1) newSelected = selected.slice(0, -1);
    else newSelected = selected.slice(0, selectedIndex).concat(selected.slice(selectedIndex + 1));
    setSelected(newSelected);
  };

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleDelete = () => {
    onDelete?.(selected);
    setSelected([]);
  };
  const isSelected = (id: string | number) => selected.indexOf(id) !== -1;
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = useMemo(() => {
    if (!orderBy)
      return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return stableSort(rows, getComparator(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [order, orderBy, page, rowsPerPage, rows]);

  function formatCellValue(value: unknown): React.ReactNode {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return formatJalaliDate(value);
    if (typeof value === "number" || typeof value === "bigint") return toPersianDigits(String(value));
    if (typeof value === "string") {
      const trimmed = value.trim();
      const normalized = trimmed.replace(/[,\s\u200C]/g, "");
      if (/^-?\d+(\.\d+)?$/.test(normalized)) return toPersianDigits(normalized);
      return trimmed;
    }
    try {
      if (typeof value === "object") return JSON.stringify(value);
    } catch {
      return String(value);
    }
    return String(value);
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2, boxShadow: "none" }}>
        <EnhancedTableToolbar numSelected={selected.length} title={title} onDelete={onDelete ? handleDelete : undefined} />
        <TableContainer>
          <Table sx={{ tableLayout: "fixed" }}>
            <EnhancedTableHead numSelected={selected.length} order={order} orderBy={orderBy} onSelectAllClick={handleSelectAllClick} onRequestSort={handleRequestSort} rowCount={rows.length} headCells={headCells} hasActions={!!actions?.length} />
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + (actions ? 2 : 1)} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {visibleRows.map((row) => {
                    const isItemSelected = isSelected(row.id);
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                        sx={{ cursor: onRowClick ? "pointer" : "default" }}
                        onClick={() => onRowClick?.(row)}
                      >
                        <TableCell padding="none" sx={{ width: 48, textAlign: "center" }}>
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClick(e, row.id);
                            }}
                          />
                        </TableCell>
                        {headCells.map((cell) => {
                          const key = cell.id as keyof T;
                          const value = row[key];
                          const content = cell.cell ? cell.cell(row) : formatCellValue(value);
                          return (
                            <TableCell key={String(cell.id)} align={cell.align ?? "center"} sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: { xs: "0.55rem", md: "0.875rem" }, p: { xs: 0.5, sm: 2 }, width: cell.width }}>
                              {content}
                            </TableCell>
                          );
                        })}
                        {actions && (
                          <TableCell align="center" sx={{ width: 90 }}>
                            {actions.map((action, i) => (
                              <Tooltip title={action.tooltip} key={i}>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(row);
                                  }}
                                >
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
                </>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "همه", value: -1 }]}
                  colSpan={headCells.length + 2}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                  labelRowsPerPage="تعداد در صفحه"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${toPersianDigits(from)}–${toPersianDigits(to)} از ${toPersianDigits(count)}`
                  }
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

