import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';

const AutoBackupHandler = () => {
  const allState = useSelector((state: RootState) => state);
  const autoBackupEnabled = useSelector((state: RootState) => state.settings.autoBackupOnExit);

  const handleSaveBackup = useCallback(() => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(allState))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      console.log('Auto backup successful.');
    } catch (error) {
      console.error('Auto backup failed:', error);
    }
  }, [allState]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (autoBackupEnabled) {
        handleSaveBackup();
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoBackupEnabled, handleSaveBackup]);

  return null;
};

export default AutoBackupHandler;
