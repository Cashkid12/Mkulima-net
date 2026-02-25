import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

interface WalletData {
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  accountNumber: string;
  currency: string;
  trustScore: number;
  kycLevel: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  reference: string;
}

export default function WalletScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    amount: '',
    recipientAccount: '',
    description: ''
  });

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallet`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setTransactions(data.transactions);
      } else {
        throw new Error('Failed to load wallet data');
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleTransfer = async () => {
    if (!transferData.amount || !transferData.recipientAccount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/wallet/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(transferData.amount),
          recipientAccount: transferData.recipientAccount,
          description: transferData.description
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Transfer completed successfully');
        setShowTransferModal(false);
        setTransferData({ amount: '', recipientAccount: '', description: '' });
        loadWalletData();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert('Error', 'Transfer failed');
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="account-balance-wallet" size={64} color="#1B5E20" />
        <Text>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MkulimaNet Wallet</Text>
        <Text style={styles.headerSubtitle}>Manage your agricultural transactions</Text>
      </View>

      {/* Wallet Balance Card */}
      <View style={styles.card}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{wallet ? formatCurrency(wallet.balance) : 'KES 0.00'}</Text>
        </View>
        
        <View style={styles.balanceDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Available</Text>
            <Text style={styles.detailValue}>{wallet ? formatCurrency(wallet.availableBalance) : 'KES 0.00'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Pending</Text>
            <Text style={styles.detailValue}>{wallet ? formatCurrency(wallet.pendingBalance) : 'KES 0.00'}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.addMoneyButton]}
            onPress={() => setShowAddMoneyModal(true)}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.transferButton]}
            onPress={() => setShowTransferModal(true)}
          >
            <MaterialIcons name="compare-arrows" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={() => setShowWithdrawModal(true)}
          >
            <MaterialIcons name="money-off" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/wallet/transactions')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionTime}>{transaction.createdAt}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionAmountText,
                    transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  <Text style={styles.transactionStatus}>{transaction.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Wallet Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.securityOptions}>
          <TouchableOpacity style={styles.securityOption}>
            <MaterialIcons name="lock" size={24} color="#1B5E20" />
            <Text style={styles.securityOptionText}>Transaction PIN</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.securityOption}>
            <MaterialIcons name="verified-user" size={24} color="#1B5E20" />
            <Text style={styles.securityOptionText}>KYC Verification</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.securityOption}>
            <MaterialIcons name="devices" size={24} color="#1B5E20" />
            <Text style={styles.securityOptionText}>Trusted Devices</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transfer Modal */}
      {showTransferModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transfer Money</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={transferData.amount}
              onChangeText={(text) => setTransferData({...transferData, amount: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Recipient Account Number"
              keyboardType="numeric"
              value={transferData.recipientAccount}
              onChangeText={(text) => setTransferData({...transferData, recipientAccount: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={transferData.description}
              onChangeText={(text) => setTransferData({...transferData, description: text})}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowTransferModal(false);
                  setTransferData({ amount: '', recipientAccount: '', description: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleTransfer}
              >
                <Text style={styles.confirmButtonText}>Transfer</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666666',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  viewAllText: {
    color: '#1B5E20',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  addMoneyButton: {
    backgroundColor: '#4CAF50',
  },
  transferButton: {
    backgroundColor: '#2196F3',
  },
  withdrawButton: {
    backgroundColor: '#FF9800',
    marginRight: 0,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
  },
  transactionsList: {
    marginBottom: -15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  transactionTime: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#F44336',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  securityOptions: {
    marginBottom: -15,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  securityOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 15,
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
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
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