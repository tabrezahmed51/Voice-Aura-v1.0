import React, { useState } from 'react';
import { GoogleDriveBackupSettings } from '../types';
import { GOOGLE_DRIVE_BACKUP_DAYS, GOOGLE_DRIVE_BACKUP_TIMES } from '../constants';
import Selector from './Selector';
import ToggleSwitch from './ToggleSwitch';

interface GoogleDriveBackupProps {
  settings?: GoogleDriveBackupSettings;
  onSettingsChange?: (settings: GoogleDriveBackupSettings) => void;
}

const CloudUploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

const CloudDoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M20 6L9 17l-5-5"></path></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const GoogleDriveBackup: React.FC<GoogleDriveBackupProps> = ({ settings, onSettingsChange }) => {
  const [backups, setBackups] = useState([
    { id: 1, name: 'Backup_2024_01', date: '2024-01-15', size: '2.3 GB', status: 'completed' },
    { id: 2, name: 'Backup_2024_02', date: '2024-01-22', size: '1.8 GB', status: 'completed' },
    { id: 3, name: 'Backup_2024_03', date: '2024-01-29', size: '2.1 GB', status: 'in-progress' },
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);

  const [localSettings, setLocalSettings] = useState<GoogleDriveBackupSettings>({
    enabled: false,
    frequency: 'weekly',
    dayOfWeek: 'Sunday',
    backupTime: '03:00',
    lastBackup: null,
    isBackingUp: false,
    backupStatus: 'Idle',
    backupProgress: 0,
  });

  const activeSettings = settings || localSettings;
  const updateSettings = onSettingsChange || setLocalSettings;

  const handleBackup = () => {
    setIsBackingUp(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          setBackups(prevBackups => [
            {
              id: Date.now(),
              name: `Backup_${new Date().toISOString().split('T')[0]}`,
              date: new Date().toLocaleDateString(),
              size: '2.5 GB',
              status: 'completed'
            },
            ...prevBackups
          ]);
          updateSettings({...activeSettings, lastBackup: new Date().toISOString()});
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSettingChange = (field: keyof GoogleDriveBackupSettings, value: any) => {
    updateSettings({ ...activeSettings, [field]: value });
  };

  return (
    <div className="tension-panel rounded-xl text-text-main max-w-3xl mx-auto">
      <div className="flex items-center mb-4">
        <div className="mr-3 text-accent">
            <CloudUploadIcon />
        </div>
        <h3 className="text-xl font-semibold text-text-main font-sans">
          Google Drive Backup
        </h3>
      </div>

      <p className="text-text-dim text-sm mb-6 font-sans">
        Securely backup your voice models, recordings, and configurations to Google Drive.
        Your data is encrypted and can be restored at any time.
      </p>

      <div className="mb-6 p-4 border border-tension-line rounded-lg bg-carbon-base">
          <div className="flex items-center mb-3">
              <span className="mr-2 text-accent"><SettingsIcon /></span>
              <h4 className="text-sm font-bold text-text-main font-mono">
                  Backup Configuration
              </h4>
          </div>
          
          <div className="mb-4">
            <ToggleSwitch
                id="backup-enabled"
                label="Enable Automated Backups"
                checked={activeSettings.enabled}
                onChange={(checked) => handleSettingChange('enabled', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <div className="w-full sm:w-1/3">
                <Selector
                    id="frequency-selector"
                    label="Frequency"
                    value={activeSettings.frequency}
                    options={[
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'manual', label: 'Manual Only' }
                    ]}
                    onChange={(val) => handleSettingChange('frequency', val as GoogleDriveBackupSettings['frequency'])}
                    disabled={!activeSettings.enabled}
                />
              </div>

              {activeSettings.frequency === 'weekly' && (
                  <div className="w-full sm:w-1/3">
                    <Selector
                        id="day-selector"
                        label="Day"
                        value={activeSettings.dayOfWeek}
                        options={GOOGLE_DRIVE_BACKUP_DAYS}
                        onChange={(val) => handleSettingChange('dayOfWeek', val as GoogleDriveBackupSettings['dayOfWeek'])}
                        disabled={!activeSettings.enabled}
                    />
                  </div>
              )}
              {activeSettings.frequency !== 'manual' && (
                  <div className="w-full sm:w-1/3">
                    <Selector
                        id="time-selector"
                        label="Time"
                        value={activeSettings.backupTime}
                        options={GOOGLE_DRIVE_BACKUP_TIMES}
                        onChange={(val) => handleSettingChange('backupTime', val as GoogleDriveBackupSettings['backupTime'])}
                        disabled={!activeSettings.enabled}
                    />
                  </div>
              )}
          </div>
          
          <div className="text-xs text-text-dim mt-4 font-mono">
              Last backup: {activeSettings.lastBackup ? new Date(activeSettings.lastBackup).toLocaleString() : 'Never'}
          </div>
      </div>

      <div className="mb-6 p-4 border border-tension-line rounded-lg bg-carbon-base">
          <div className="flex items-center mb-3">
              <span className="mr-2 text-accent"><RefreshIcon /></span>
              <h4 className="text-sm font-bold text-text-main font-mono">
                  Manual Backup & Restore
              </h4>
          </div>
          <button 
              onClick={handleBackup} 
              disabled={isBackingUp}
              className="w-full bg-accent hover:bg-accent-dim disabled:bg-carbon-base disabled:text-text-dim disabled:cursor-not-allowed text-carbon-base font-bold py-2 rounded-lg transition-colors text-sm uppercase tracking-wider shadow-lg shadow-accent-dim flex items-center justify-center gap-2"
          >
              {isBackingUp ? (
                  <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      BACKING UP ({progress}%)
                  </>
              ) : (
                  <>
                      <CloudUploadIcon /> INITIATE BACKUP
                  </>
              )}
          </button>

          <h5 className="text-xs font-bold text-text-dim uppercase tracking-wider mt-6 mb-2 border-b border-tension-line pb-1">Previous Backups</h5>
          <div className="space-y-2">
              {backups.length === 0 ? (
                  <p className="text-xs text-text-dim italic">No previous backups found.</p>
              ) : (
                  backups.map(backup => (
                      <div key={backup.id} className="flex justify-between items-center bg-carbon-weave p-2 rounded-lg border border-tension-line text-xs font-mono">
                          <div>
                              <span className="text-text-main">{backup.name}</span>
                              <span className="text-text-dim ml-2">{backup.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-text-dim">{backup.size}</span>
                              {backup.status === 'completed' ? (
                                  <span className="text-success flex items-center"><CloudDoneIcon /></span>
                              ) : (
                                  <span className="text-yellow-400 flex items-center animate-pulse">...</span>
                              )}
                              <button className="p-1 text-text-dim hover:text-accent rounded-full"><DownloadIcon /></button>
                              <button className="p-1 text-text-dim hover:text-danger rounded-full"><DeleteIcon /></button>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default GoogleDriveBackup;