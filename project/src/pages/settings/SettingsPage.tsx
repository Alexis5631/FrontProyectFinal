import React, { useState } from 'react';
import { Save, User, Building, Bell, Shield, Database, Palette, Globe, Download, Upload, Key, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    name: 'Profile Settings',
    icon: User,
    description: 'Manage your personal information and preferences',
  },
  {
    id: 'company',
    name: 'Company Settings',
    icon: Building,
    description: 'Configure workshop information and business details',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    description: 'Control email and system notifications',
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    description: 'Password, two-factor authentication, and security logs',
  },
  {
    id: 'system',
    name: 'System Settings',
    icon: Database,
    description: 'Database, backups, and system configuration',
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: Palette,
    description: 'Theme, colors, and interface customization',
  },
  {
    id: 'localization',
    name: 'Localization',
    icon: Globe,
    description: 'Language, timezone, and regional settings',
  },
];

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode }>({ title: '', content: null });
  const [isLoading, setIsLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(new Date(Date.now() - 1000 * 60 * 60 * 6)); // 6 hours ago
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    
    // Company Settings
    companyName: 'AutoTaller Workshop',
    companyAddress: '123 Main Street, City, State 12345',
    companyPhone: '+1-555-0100',
    companyEmail: 'info@autotaller.com',
    taxId: '12-3456789',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    lowStockAlerts: true,
    invoiceReminders: true,
    
    // Security Settings
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    
    // Appearance Settings
    theme: 'light',
    primaryColor: 'blue',
    compactMode: false,
    
    // Localization Settings
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Saving settings:', settings);
      
      // Show success message
      setModalContent({
        title: 'Settings Saved',
        content: (
          <div className="text-center py-4">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Settings saved successfully!</p>
            <p className="text-gray-600">Your changes have been applied and will take effect immediately.</p>
          </div>
        )
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setModalContent({
        title: 'Error',
        content: (
          <div className="text-center py-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Failed to save settings</p>
            <p className="text-gray-600">Please try again or contact support if the problem persists.</p>
          </div>
        )
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    setModalContent({
      title: 'Change Password',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              setTimeout(() => {
                setModalContent({
                  title: 'Password Changed',
                  content: (
                    <div className="text-center py-4">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Password updated successfully!</p>
                      <p className="text-gray-600">Your password has been changed. Please use your new password for future logins.</p>
                    </div>
                  )
                });
                setIsModalOpen(true);
              }, 500);
            }}>
              <Key className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </div>
        </div>
      )
    });
    setIsModalOpen(true);
  };

  const handleManualBackup = async () => {
    setIsLoading(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setLastBackup(new Date());
      
      setModalContent({
        title: 'Backup Complete',
        content: (
          <div className="text-center py-4">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Backup created successfully!</p>
            <p className="text-gray-600">Your data has been backed up to secure storage.</p>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Backup ID:</strong> BKP-{Date.now().toString().slice(-8)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Size:</strong> 2.4 MB
              </p>
              <p className="text-sm text-gray-600">
                <strong>Created:</strong> {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        )
      });
      setIsModalOpen(true);
    } catch (error) {
      setModalContent({
        title: 'Backup Failed',
        content: (
          <div className="text-center py-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Backup failed</p>
            <p className="text-gray-600">Unable to create backup. Please try again later.</p>
          </div>
        )
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadLogs = async () => {
    setIsLoading(true);
    try {
      // Simulate log generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock log file
      const logContent = `
AutoTaller System Logs - ${new Date().toISOString()}
================================================

[${new Date().toISOString()}] INFO: System startup completed
[${new Date(Date.now() - 1000 * 60 * 30).toISOString()}] INFO: User login: admin@example.com
[${new Date(Date.now() - 1000 * 60 * 60).toISOString()}] INFO: Backup completed successfully
[${new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()}] WARN: Low stock alert: Brake Pads
[${new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()}] INFO: Invoice generated: INV-001
[${new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()}] INFO: Service order completed: ORD-123

End of logs
      `;
      
      const blob = new Blob([logContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autotaller-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setModalContent({
        title: 'Logs Downloaded',
        content: (
          <div className="text-center py-4">
            <Download className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">System logs downloaded!</p>
            <p className="text-gray-600">The log file has been saved to your downloads folder.</p>
          </div>
        )
      });
      setIsModalOpen(true);
    } catch (error) {
      setModalContent({
        title: 'Download Failed',
        content: (
          <div className="text-center py-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Download failed</p>
            <p className="text-gray-600">Unable to download logs. Please try again later.</p>
          </div>
        )
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = () => {
    setModalContent({
      title: 'Restore from Backup',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Restoring from backup will overwrite all current data. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Backup File
            </label>
            <input
              type="file"
              accept=".bak,.sql,.zip"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Available Backups:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <p className="text-sm font-medium">BKP-{Date.now().toString().slice(-8)}</p>
                  <p className="text-xs text-gray-500">{lastBackup.toLocaleString()} • 2.4 MB</p>
                </div>
                <Button size="sm" variant="outline">Select</Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <p className="text-sm font-medium">BKP-{(Date.now() - 86400000).toString().slice(-8)}</p>
                  <p className="text-xs text-gray-500">{new Date(Date.now() - 86400000).toLocaleString()} • 2.3 MB</p>
                </div>
                <Button size="sm" variant="outline">Select</Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => {
              setIsModalOpen(false);
              setTimeout(() => {
                setModalContent({
                  title: 'Restore Complete',
                  content: (
                    <div className="text-center py-4">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Data restored successfully!</p>
                      <p className="text-gray-600">Your system has been restored from the selected backup.</p>
                    </div>
                  )
                });
                setIsModalOpen(true);
              }, 500);
            }}>
              <Upload className="h-4 w-4 mr-2" />
              Restore Backup
            </Button>
          </div>
        </div>
      )
    });
    setIsModalOpen(true);
  };

  const handleTestNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setModalContent({
        title: 'Test Notifications',
        content: (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Bell className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Test notifications sent!</p>
              <p className="text-gray-600">Check your email and phone for test messages.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">Email notification sent</span>
                </div>
                <span className="text-xs text-green-600">✓ Delivered</span>
              </div>
              
              {settings.smsNotifications && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">SMS notification sent</span>
                  </div>
                  <span className="text-xs text-green-600">✓ Delivered</span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">In-app notification sent</span>
                </div>
                <span className="text-xs text-blue-600">✓ Delivered</span>
              </div>
            </div>
          </div>
        )
      });
      setIsModalOpen(true);
    } catch (error) {
      setModalContent({
        title: 'Test Failed',
        content: (
          <div className="text-center py-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Test notifications failed</p>
            <p className="text-gray-600">Unable to send test notifications. Please check your settings.</p>
          </div>
        )
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const settingsExport = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        settings: settings,
        metadata: {
          user: user?.email,
          system: 'AutoTaller Manager',
        }
      };
      
      const blob = new Blob([JSON.stringify(settingsExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autotaller-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setModalContent({
        title: 'Settings Exported',
        content: (
          <div className="text-center py-4">
            <Download className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Settings exported successfully!</p>
            <p className="text-gray-600">Your configuration has been saved to a file.</p>
          </div>
        )
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSettings = () => {
    setModalContent({
      title: 'Import Settings',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Upload className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                Import settings from a previously exported configuration file.
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Settings File
            </label>
            <input
              type="file"
              accept=".json"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsModalOpen(false);
              setTimeout(() => {
                setModalContent({
                  title: 'Settings Imported',
                  content: (
                    <div className="text-center py-4">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Settings imported successfully!</p>
                      <p className="text-gray-600">Your configuration has been updated with the imported settings.</p>
                    </div>
                  )
                });
                setIsModalOpen(true);
              }, 500);
            }}>
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
          </div>
        </div>
      )
    });
    setIsModalOpen(true);
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={settings.firstName}
              onChange={(e) => handleSettingChange('firstName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={settings.lastName}
              onChange={(e) => handleSettingChange('lastName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleSettingChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleSettingChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline" onClick={handleImportSettings}>
            <Upload className="h-4 w-4 mr-2" />
            Import Settings
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => handleSettingChange('companyName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={settings.companyAddress}
              onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={settings.companyPhone}
              onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.companyEmail}
              onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID
            </label>
            <input
              type="text"
              value={settings.taxId}
              onChange={(e) => handleSettingChange('taxId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Order Updates</h4>
              <p className="text-sm text-gray-500">Get notified when order status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.orderUpdates}
                onChange={(e) => handleSettingChange('orderUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Low Stock Alerts</h4>
              <p className="text-sm text-gray-500">Alert when parts are running low</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lowStockAlerts}
                onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Invoice Reminders</h4>
              <p className="text-sm text-gray-500">Remind about overdue invoices</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.invoiceReminders}
                onChange={(e) => handleSettingChange('invoiceReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={handleTestNotifications} loading={isLoading}>
          <Bell className="h-4 w-4 mr-2" />
          Test Notifications
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Expiry (days)
            </label>
            <select
              value={settings.passwordExpiry}
              onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
              <option value={0}>Never</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleChangePassword} className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Automatic Backups</h4>
              <p className="text-sm text-gray-500">Automatically backup your data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!settings.autoBackup}
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Retention (days)
            </label>
            <select
              value={settings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
              <option value={730}>2 years</option>
              <option value={1825}>5 years</option>
              <option value={-1}>Forever</option>
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Backup Status</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Last Backup:</span>
                <span>{lastBackup.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Next Backup:</span>
                <span>
                  {settings.autoBackup 
                    ? new Date(lastBackup.getTime() + (settings.backupFrequency === 'daily' ? 86400000 : 3600000)).toLocaleString()
                    : 'Manual only'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Backup Size:</span>
                <span>2.4 MB</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleManualBackup}
              loading={isLoading}
            >
              <Database className="h-4 w-4 mr-2" />
              Create Manual Backup
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleRestoreBackup}
            >
              <Upload className="h-4 w-4 mr-2" />
              Restore from Backup
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDownloadLogs}
              loading={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download System Logs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interface Customization</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="grid grid-cols-6 gap-3">
              {['blue', 'green', 'purple', 'red', 'orange', 'teal'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleSettingChange('primaryColor', color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    settings.primaryColor === color ? 'border-gray-900 scale-110' : 'border-gray-300 hover:scale-105'
                  } bg-${color}-500`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Compact Mode</h4>
              <p className="text-sm text-gray-500">Use smaller spacing and elements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => {
              setModalContent({
                title: 'Theme Preview',
                content: (
                  <div className="space-y-4">
                    <p className="text-gray-600">Preview how your interface will look with different themes:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-white">
                        <h4 className="font-medium mb-2">Light Theme</h4>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-blue-500 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-gray-900 text-white">
                        <h4 className="font-medium mb-2">Dark Theme</h4>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-700 rounded"></div>
                          <div className="h-2 bg-blue-400 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                        <h4 className="font-medium mb-2">Auto Theme</h4>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-300 rounded"></div>
                          <div className="h-2 bg-purple-500 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              });
              setIsModalOpen(true);
            }}>
              <Palette className="h-4 w-4 mr-2" />
              Preview Themes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocalizationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="MM/dd/yyyy">MM/DD/YYYY</option>
              <option value="dd/MM/yyyy">DD/MM/YYYY</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD</option>
              <option value="dd MMM yyyy">DD MMM YYYY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="MXN">MXN - Mexican Peso</option>
            </select>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Date:</strong> {new Date().toLocaleDateString(settings.language === 'en' ? 'en-US' : settings.language)}</p>
            <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
            <p><strong>Currency:</strong> {new Intl.NumberFormat(settings.language === 'en' ? 'en-US' : settings.language, {
              style: 'currency',
              currency: settings.currency
            }).format(1234.56)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'company':
        return renderCompanySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'localization':
        return renderLocalizationSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <Layout title="Settings">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Settings</h2>
            </div>
            <nav className="p-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-gray-500">{section.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {settingsSections.find(s => s.id === activeSection)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {settingsSections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>
                <Button onClick={handleSave} loading={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for various actions */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        size="lg"
      >
        {modalContent.content}
      </Modal>
    </Layout>
  );
};