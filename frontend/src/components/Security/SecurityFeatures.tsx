'use client';

import { useState } from 'react';
import { Shield, Key, Eye, EyeOff, Smartphone, QrCode, AlertTriangle, CheckCircle, Lock, UserCheck, Clock, ShieldCheck } from 'lucide-react';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  transactionPinEnabled: boolean;
  biometricEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  trustedDevices: TrustedDevice[];
  securityQuestions: SecurityQuestion[];
}

interface TrustedDevice {
  id: string;
  name: string;
  type: string;
  lastActive: string;
  current: boolean;
  location: string;
}

interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

export default function SecurityFeatures() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    transactionPinEnabled: false,
    biometricEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    trustedDevices: [
      {
        id: '1',
        name: 'iPhone 14 Pro',
        type: 'Mobile',
        lastActive: '2 hours ago',
        current: true,
        location: 'Nairobi, Kenya'
      },
      {
        id: '2',
        name: 'Windows Laptop',
        type: 'Desktop',
        lastActive: '1 day ago',
        current: false,
        location: 'Nairobi, Kenya'
      }
    ],
    securityQuestions: [
      {
        id: '1',
        question: 'What was your first pet\'s name?',
        answer: 'encrypted'
      },
      {
        id: '2',
        question: 'What city were you born in?',
        answer: 'encrypted'
      }
    ]
  });

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const toggleSetting = (setting: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const setupTransactionPin = () => {
    if (pin.length === 4 && pin === confirmPin) {
      setSettings(prev => ({
        ...prev,
        transactionPinEnabled: true
      }));
      setShowPinSetup(false);
      setPin('');
      setConfirmPin('');
      // Save PIN securely (would be encrypted in real implementation)
    }
  };

  const setupTwoFactorAuth = () => {
    // Generate QR code and backup codes
    setQrCode('mock-qr-code-data');
    setBackupCodes([
      'ABCD-EFGH-IJKL',
      'MNOP-QRST-UVWX',
      'YZ12-3456-7890',
      'AB12-CD34-EF56'
    ]);
    setSettings(prev => ({
      ...prev,
      twoFactorEnabled: true
    }));
  };

  const removeDevice = (deviceId: string) => {
    setSettings(prev => ({
      ...prev,
      trustedDevices: prev.trustedDevices.filter(d => d.id !== deviceId)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
        </div>
        <p className="text-gray-600">
          Protect your account and transactions with advanced security features
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              onClick={() => setShow2FASetup(!show2FASetup)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                settings.twoFactorEnabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {settings.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {show2FASetup && (
          <div className="p-6 border-b border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Scan QR Code</h4>
                <p className="text-gray-600">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center text-sm text-gray-600 mb-2">
                  Or enter this code manually:
                </div>
                <div className="text-center font-mono text-lg font-bold text-gray-900">
                  MKULIMA-NET-2FA-CODE
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono"
                  placeholder="000000"
                />
              </div>

              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Backup Codes</h5>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-gray-100 rounded px-3 py-2 text-center font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Save these codes in a secure location. They can be used if you lose access to your authenticator app.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShow2FASetup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={setupTwoFactorAuth}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Active</span>
              </div>
              <p className="text-sm text-blue-700">2FA is currently enabled on your account</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Authenticator App</span>
              </div>
              <p className="text-sm text-gray-600">Using Google Authenticator or similar</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Backup Codes</span>
              </div>
              <p className="text-sm text-gray-600">8 codes remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction PIN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Transaction PIN</h3>
                <p className="text-sm text-gray-600">Require PIN for wallet transactions</p>
              </div>
            </div>
            <button
              onClick={() => setShowPinSetup(!showPinSetup)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                settings.transactionPinEnabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {settings.transactionPinEnabled ? 'Change PIN' : 'Set PIN'}
            </button>
          </div>
        </div>

        {showPinSetup && (
          <div className="p-6 border-b border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {settings.transactionPinEnabled ? 'Change Your PIN' : 'Set Transaction PIN'}
                </h4>
                <p className="text-gray-600">
                  Create a 4-digit PIN for secure transactions
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 4-digit PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  placeholder="••••"
                />
                {pin && confirmPin && pin !== confirmPin && (
                  <p className="text-sm text-red-600 mt-1">PINs do not match</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPinSetup(false);
                    setPin('');
                    setConfirmPin('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={setupTransactionPin}
                  disabled={pin.length !== 4 || pin !== confirmPin}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settings.transactionPinEnabled ? 'Update PIN' : 'Set PIN'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {settings.transactionPinEnabled ? 'PIN is active' : 'PIN not set'}
            </span>
          </div>
          <p className="text-gray-600">
            {settings.transactionPinEnabled 
              ? 'Your transaction PIN is active and will be required for all wallet transactions'
              : 'Set up a transaction PIN to add an extra layer of security to your wallet'
            }
          </p>
        </div>
      </div>

      {/* Login Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Login Security</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Login Alerts</h4>
                  <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('loginAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.loginAlerts ? 'bg-green-600' : 'bg-gray-200'
                }`}
                aria-label={settings.loginAlerts ? "Disable login alerts" : "Enable login alerts"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Session Timeout</h4>
                  <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                </div>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  sessionTimeout: parseInt(e.target.value)
                }))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Session timeout duration"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Biometric Login</h4>
                  <p className="text-sm text-gray-600">Use fingerprint or face recognition</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('biometricEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.biometricEnabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
                aria-label={settings.biometricEnabled ? "Disable biometric login" : "Enable biometric login"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Trusted Devices</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage devices that can access your account
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {settings.trustedDevices.map((device) => (
              <div key={device.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                device.current 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    device.current ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{device.name}</h4>
                    <p className="text-sm text-gray-600">
                      {device.type} • Last active: {device.lastActive} • {device.location}
                    </p>
                  </div>
                </div>
                {!device.current && (
                  <button
                    onClick={() => removeDevice(device.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}