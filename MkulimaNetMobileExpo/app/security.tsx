import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function SecurityScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [transactionPinEnabled, setTransactionPinEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const toggleSetting = async (setting: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/security/${setting}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ enabled: !getCurrentValue(setting) }),
      });

      if (response.ok) {
        updateState(setting);
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);
      Alert.alert('Error', `Failed to update ${setting}`);
    }
  };

  const getCurrentValue = (setting: string) => {
    switch (setting) {
      case 'twoFactor': return twoFactorEnabled;
      case 'transactionPin': return transactionPinEnabled;
      case 'biometric': return biometricEnabled;
      case 'loginAlerts': return loginAlerts;
      default: return false;
    }
  };

  const updateState = (setting: string) => {
    switch (setting) {
      case 'twoFactor':
        setTwoFactorEnabled(!twoFactorEnabled);
        break;
      case 'transactionPin':
        setTransactionPinEnabled(!transactionPinEnabled);
        break;
      case 'biometric':
        setBiometricEnabled(!biometricEnabled);
        break;
      case 'loginAlerts':
        setLoginAlerts(!loginAlerts);
        break;
    }
  };

  const setupTransactionPin = async () => {
    if (pin.length !== 4 || pin !== confirmPin) {
      Alert.alert('Error', 'PIN must be 4 digits and match confirmation');
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/security/transaction-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Transaction PIN set successfully');
        setTransactionPinEnabled(true);
        setShowPinSetup(false);
        setPin('');
        setConfirmPin('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set PIN');
      }
    } catch (error) {
      console.error('Error setting PIN:', error);
      Alert.alert('Error', error.message || 'Failed to set transaction PIN');
    }
  };

  const renderSecurityOption = (icon: string, title: string, subtitle: string, value: boolean, onToggle: () => void) => (
    <TouchableOpacity style={styles.optionContainer} onPress={onToggle}>
      <View style={styles.optionIcon}>
        <MaterialIcons name={icon as any} size={24} color="#1B5E20" />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        thumbColor="#FFFFFF"
        trackColor={{ false: '#CCCCCC', true: '#1B5E20' }}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security Settings</Text>
        <Text style={styles.headerSubtitle}>Protect your account and transactions</Text>
      </View>

      {/* Account Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Security</Text>
        
        {renderSecurityOption(
          'lock',
          'Two-Factor Authentication',
          'Add an extra layer of security to your account',
          twoFactorEnabled,
          () => toggleSetting('twoFactor')
        )}

        {renderSecurityOption(
          'lock-outline',
          'Transaction PIN',
          'Require PIN for all wallet transactions',
          transactionPinEnabled,
          () => setShowPinSetup(true)
        )}

        {renderSecurityOption(
          'fingerprint',
          'Biometric Login',
          'Use fingerprint or face recognition to login',
          biometricEnabled,
          () => toggleSetting('biometric')
        )}

        {renderSecurityOption(
          'notifications-active',
          'Login Alerts',
          'Get notified of new login attempts',
          loginAlerts,
          () => toggleSetting('loginAlerts')
        )}
      </View>

      {/* Session Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Settings</Text>
        
        <View style={styles.optionContainer}>
          <View style={styles.optionIcon}>
            <MaterialIcons name="timer" size={24} color="#1B5E20" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Session Timeout</Text>
            <Text style={styles.optionSubtitle}>Auto-logout after inactivity</Text>
          </View>
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>{sessionTimeout} min</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" />
          </View>
        </View>
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.optionContainer}>
          <View style={styles.optionIcon}>
            <MaterialIcons name="visibility" size={24} color="#1B5E20" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Profile Visibility</Text>
            <Text style={styles.optionSubtitle}>Who can see your profile</Text>
          </View>
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>Public</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" />
          </View>
        </View>

        <View style={styles.optionContainer}>
          <View style={styles.optionIcon}>
            <MaterialIcons name="mail" size={24} color="#1B5E20" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Email Privacy</Text>
            <Text style={styles.optionSubtitle}>Who can contact you by email</Text>
          </View>
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>Everyone</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" />
          </View>
        </View>
      </View>

      {/* Trusted Devices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trusted Devices</Text>
        
        <TouchableOpacity style={styles.deviceItem}>
          <View style={styles.deviceIcon}>
            <MaterialIcons name="phone-android" size={24} color="#1B5E20" />
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>Your Phone</Text>
            <Text style={styles.deviceDetails}>Currently active • Nairobi, KE</Text>
          </View>
          <Text style={styles.deviceStatus}>Current</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deviceItem}>
          <View style={styles.deviceIcon}>
            <MaterialIcons name="laptop" size={24} color="#666666" />
          </View>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>Work Laptop</Text>
            <Text style={styles.deviceDetails}>Last active: 2 days ago</Text>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color="#666666" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Security Tips */}
      <View style={styles.tipsSection}>
        <View style={styles.tipItem}>
          <MaterialIcons name="lock" size={20} color="#4CAF50" />
          <Text style={styles.tipText}>Use strong, unique passwords</Text>
        </View>
        <View style={styles.tipItem}>
          <MaterialIcons name="vpn-key" size={20} color="#4CAF50" />
          <Text style={styles.tipText}>Enable two-factor authentication</Text>
        </View>
        <View style={styles.tipItem}>
          <MaterialIcons name="warning" size={20} color="#FF9800" />
          <Text style={styles.tipText}>Never share your PIN with anyone</Text>
        </View>
      </View>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Transaction PIN</Text>
            
            <Text style={styles.modalSubtitle}>Create a 4-digit PIN for secure transactions</Text>
            
            <TextInput
              style={styles.pinInput}
              placeholder="Enter 4-digit PIN"
              keyboardType="number-pad"
              maxLength={4}
              value={pin}
              onChangeText={setPin}
              secureTextEntry
            />
            
            <TextInput
              style={styles.pinInput}
              placeholder="Confirm PIN"
              keyboardType="number-pad"
              maxLength={4}
              value={confirmPin}
              onChangeText={setConfirmPin}
              secureTextEntry
            />
            
            {pin && confirmPin && pin !== confirmPin && (
              <Text style={styles.errorText}>PINs do not match</Text>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowPinSetup(false);
                  setPin('');
                  setConfirmPin('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={setupTransactionPin}
                disabled={pin.length !== 4 || pin !== confirmPin}
              >
                <Text style={styles.confirmButtonText}>Set PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  deviceDetails: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666666',
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});