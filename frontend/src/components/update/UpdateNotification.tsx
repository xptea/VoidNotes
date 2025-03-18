import React from 'react';
import { useAutoUpdate } from './AutoUpdate.js';

interface UpdateNotificationProps {
  className?: string;
  showVersionOnly?: boolean;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ className = '', showVersionOnly = false }) => {
  const {
    currentVersion,
    latestVersion,
    isUpdateAvailable,
    isChecking,
    checkForUpdates,
    handleUpdate
  } = useAutoUpdate();

  if (showVersionOnly) {
    return <span className={className}>{currentVersion}</span>;
  }

  return (
    <div className={`text-xs ${className}`}>
    <div className="flex items-center justify-center text-center">
      <span>Version: {currentVersion}</span>
      {isUpdateAvailable && (
        <button
        onClick={handleUpdate}
        className="ml-2 px-2 py-0.5 bg-green-500/60 hover:bg-green-500/80 rounded text-white text-xs transition-colors"
        title={`Update to ${latestVersion}`}
        >
        Update
        </button>
      )}
    </div>
      {isUpdateAvailable && (
        <div className="text-green-400 mt-0.5">New version available: {latestVersion}</div>
      )}
      <button 
        onClick={checkForUpdates}
        className="text-white/50 hover:text-white/80 text-xs mt-1 transition-colors"
        disabled={isChecking}
      >
        {isChecking ? 'Checking...' : ''}
      </button>
    </div>
  );
};

export default UpdateNotification;