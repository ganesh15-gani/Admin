export interface AppSettings {
  platformName: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  requireMFA: boolean;
  sessionTimeout: string;
  commissionRate: string;
  payoutSchedule: string;
}

const defaultSettings: AppSettings = {
  platformName: 'StayZen',
  supportEmail: 'support@stayzen.com',
  currency: 'USD ($)',
  timezone: 'UTC (Coordinated Universal Time)',
  requireMFA: true,
  sessionTimeout: '30',
  commissionRate: '15',
  payoutSchedule: 'Weekly'
};

export const settingsService = {
  getSettings: (): AppSettings => {
    const stored = localStorage.getItem('stayzen_settings');
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  },
  
  saveSettings: (settings: Partial<AppSettings>) => {
    const current = settingsService.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('stayzen_settings', JSON.stringify(updated));
    
    // Dispatch event to notify other components (like Dashboard)
    window.dispatchEvent(new Event('settings_updated'));
  },

  getCurrencyCode: (): string => {
    const currencyStr = settingsService.getSettings().currency;
    if (currencyStr.includes('INR')) return 'INR';
    if (currencyStr.includes('EUR')) return 'EUR';
    if (currencyStr.includes('GBP')) return 'GBP';
    return 'USD';
  },

  getCurrencyLocale: (): string => {
    const currencyStr = settingsService.getSettings().currency;
    if (currencyStr.includes('INR')) return 'en-IN';
    if (currencyStr.includes('EUR')) return 'de-DE';
    if (currencyStr.includes('GBP')) return 'en-GB';
    return 'en-US';
  }
};
