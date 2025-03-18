import { useState, useEffect } from 'react';
import localVersion from '../../version.txt?raw';

interface AutoUpdateHookProps {
  onUpdate?: () => void;
}

export const useAutoUpdate = ({ onUpdate }: AutoUpdateHookProps = {}) => {
  const [currentVersion] = useState<string>(localVersion.trim());
  const [latestVersion, setLatestVersion] = useState<string>(localVersion.trim());
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchLatestVersion = async () => {
    try {
      setIsChecking(true);
      const response = await fetch('https://raw.githubusercontent.com/xptea/VoidNotes/refs/heads/main/frontend/src/version.txt', { cache: 'no-store' });
      if (response.ok) {
        const remoteVersion = await response.text();
        setLatestVersion(remoteVersion.trim());
        
        const isNewer = compareVersions(remoteVersion.trim(), currentVersion);
        setIsUpdateAvailable(isNewer);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  const compareVersions = (v1: string, v2: string): boolean => {
    const v1Parts = v1.replace('v', '').split('.').map(Number);
    const v2Parts = v2.replace('v', '').split('.').map(Number);
    
    for (let i = 0; i < v1Parts.length; i++) {
      if (v1Parts[i] > v2Parts[i]) return true;
      if (v1Parts[i] < v2Parts[i]) return false;
    }
    
    return false;
  };

  useEffect(() => {
    fetchLatestVersion();
    
    const interval = setInterval(fetchLatestVersion, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    } else {
      window.open('https://github.com/xptea/VoidNotes/releases', '_blank');
    }
  };

  return {
    currentVersion,
    latestVersion,
    isUpdateAvailable,
    isChecking,
    lastChecked,
    checkForUpdates: fetchLatestVersion,
    handleUpdate
  };
};

export default useAutoUpdate;