import { useState, useEffect } from 'react';

interface UserPreferences {
  dataView: {
    defaultFilter: string;
    itemsPerPage: number;
    sortBy: 'timestamp' | 'type' | 'total';
    sortOrder: 'asc' | 'desc';
    showStats: boolean;
    compactView: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  dashboard: {
    defaultTab: string;
    showAnimations: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

const defaultPreferences: UserPreferences = {
  dataView: {
    defaultFilter: 'all',
    itemsPerPage: 10,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    showStats: true,
    compactView: false,
    autoRefresh: true,
    refreshInterval: 2000,
  },
  dashboard: {
    defaultTab: 'employee',
    showAnimations: true,
    theme: 'auto',
  },
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = {
        ...preferences,
        ...newPreferences,
        dataView: { ...preferences.dataView, ...newPreferences.dataView },
        dashboard: { ...preferences.dashboard, ...newPreferences.dashboard },
      };
      
      setPreferences(updatedPreferences);
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      
      console.log('User preferences saved:', updatedPreferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  // Update specific data view preferences
  const updateDataViewPreferences = (dataViewPrefs: Partial<UserPreferences['dataView']>) => {
    savePreferences({
      dataView: { ...preferences.dataView, ...dataViewPrefs }
    });
  };

  // Update specific dashboard preferences
  const updateDashboardPreferences = (dashboardPrefs: Partial<UserPreferences['dashboard']>) => {
    savePreferences({
      dashboard: { ...preferences.dashboard, ...dashboardPrefs }
    });
  };

  // Reset to default preferences
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('userPreferences');
  };

  return {
    preferences,
    isLoading,
    savePreferences,
    updateDataViewPreferences,
    updateDashboardPreferences,
    resetPreferences,
  };
}