import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function WalletScreen() {
  const { authState } = useAuth();
  const [balance, setBalance] = useState(456750); // Mock balance
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'deposit', amount: 50000, description: 'M-Pesa Deposit', date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'withdrawal', amount: 15000, description: 'Bank Transfer', date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'transfer', amount: 8500, description: 'Transfer to John', date: '2024-01-13', status: 'completed' },
    { id: 4, type: 'payment', amount: 12000, description: 'Market Purchase', date: '2024-01-12', status: 'completed' },
    { id: 5, type: 'deposit', amount: 75000, description: 'Sale Proceeds', date: '2024-01-10', status: 'completed' },
  ]);

  const quickActions = [
    { id: 'deposit', title: 'Deposit', icon: 'add', color: '#10B981' },
    { id: 'withdraw', title: 'Withdraw', icon: 'remove', color: '#EF4444' },
    { id: 'transfer', title: 'Transfer', icon: 'swap-horiz', color: '#3B82F6' },
    { id: 'pay', title: 'Pay', icon: 'receipt', color: '#F59E0B' },
  ];

  const renderQuickAction = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.quickActionCard}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${item.color}20` }]}>
        <MaterialIcons name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }: { item: any }) => {
    const isPositive = item.type === 'deposit';
    const iconMap: Record<string, string> = {
      deposit: 'add',
      withdrawal: 'remove',
      transfer: 'swap-horiz',
      payment: 'receipt'
    };
    
    return (
      <TouchableOpacity style={styles.transactionCard}>
        <View style={styles.transactionIcon}>
          <MaterialIcons 
            name={iconMap[item.type] || 'receipt'} 
            size={20} 
            color={isPositive ? '#10B981' : '#EF4444'} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
        <Text style={[
          styles.transactionAmount, 
          { color: isPositive ? '#10B981' : '#EF4444' }
        ]}>
          {isPositive ? '+' : '-'}KSh {item.amount.toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity>
              <MaterialIcons name="visibility" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>KSh {balance.toLocaleString()}</Text>
          <Text style={styles.balanceNote}>Secure & ready for transactions</Text>
          
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.balanceActionButton}>
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.balanceActionText}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.balanceActionButton}>
              <MaterialIcons name="remove" size={20} color="#FFFFFF" />
              <Text style={styles.balanceActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodIcon}>
                <MaterialIcons name="phone-android" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>M-Pesa</Text>
                <Text style={styles.paymentMethodSubtitle}>Mobile Money</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodIcon}>
                <MaterialIcons name="account-balance" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>Bank</Text>
                <Text style={styles.paymentMethodSubtitle}>Bank Transfer</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.paymentMethodCard}>
              <View style={styles.paymentMethodIcon}>
                <MaterialIcons name="credit-card" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>Card</Text>
                <Text style={styles.paymentMethodSubtitle}>Debit/Credit</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.transactionsList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  balanceCard: {
    backgroundColor: '#1B5E20',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#F5F5F5',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceNote: {
    fontSize: 14,
    color: '#DCDCDC',
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  balanceActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 16,
  },
  quickActionsList: {
    paddingHorizontal: 4,
  },
  quickActionCard: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    width: 80,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodCard: {
    flex: 0.3,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  paymentMethodInfo: {
    alignItems: 'center',
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666666',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});