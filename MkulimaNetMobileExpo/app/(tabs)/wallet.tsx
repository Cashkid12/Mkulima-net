import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Dimensions, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const colors = {
  white: '#FFFFFF',
  primaryGreen: '#2E7D32',
  secondaryGreen: '#4CAF50',
  lightGreen: '#E8F5E9',
  darkGreen: '#1B5E20',
  darkCharcoal: '#222222',
  mediumGray: '#757575',
  lightGray: '#F5F7FA',
  borderGray: '#E0E0E0',
  orange: '#F57C00',
  red: '#F44336',
  blue: '#2196F3',
};

type TxType = 'income' | 'expense' | 'escrow' | 'pending';
type DepositStep = 0 | 1 | 2 | 3;

interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  ref?: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockTransactions: Transaction[] = [
  { id: 't1', type: 'income', amount: 12500, title: "Payment from John's Farm", subtitle: 'Farm produce sale', time: '2:30 PM', date: 'MAY 15, 2024', status: 'completed' },
  { id: 't2', type: 'expense', amount: 5000, title: 'Withdrawal to M-Pesa', subtitle: 'To +254 712 345 678', time: '10:15 AM', date: 'MAY 15, 2024', status: 'completed' },
  { id: 't3', type: 'escrow', amount: 2500, title: 'Escrow - Maize Seeds', subtitle: 'Green Valley Farms', time: '3:45 PM', date: 'MAY 14, 2024', status: 'pending', ref: 'Released on delivery' },
  { id: 't4', type: 'income', amount: 20000, title: 'Deposit from M-Pesa', subtitle: '', time: '11:20 AM', date: 'MAY 14, 2024', status: 'completed', ref: 'MPESA-XYZ123' },
  { id: 't5', type: 'expense', amount: 3200, title: 'Payment to Molo Fresh', subtitle: 'Tomatoes & Potatoes', time: '9:30 AM', date: 'MAY 14, 2024', status: 'completed' },
  { id: 't6', type: 'income', amount: 50000, title: 'Bank Transfer', subtitle: 'Equity Bank - Salary', time: '4:00 PM', date: 'MAY 13, 2024', status: 'completed' },
];

const quickAmounts = [1000, 2500, 5000, 10000, 20000];

function getTxIcon(type: TxType) {
  switch (type) {
    case 'income': return { name: 'arrow-downward' as const, color: colors.secondaryGreen, bg: colors.lightGreen };
    case 'expense': return { name: 'arrow-upward' as const, color: colors.red, bg: '#FFEBEE' };
    case 'escrow': return { name: 'lock-outline' as const, color: colors.orange, bg: '#FFF3E0' };
    case 'pending': return { name: 'schedule' as const, color: colors.orange, bg: '#FFF3E0' };
  }
}

export default function WalletScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeDateRange, setActiveDateRange] = useState('Month');
  const [showHistory, setShowHistory] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositStep, setDepositStep] = useState<DepositStep>(0);
  const [depositAmount, setDepositAmount] = useState('5000');
  const [depositMethod, setDepositMethod] = useState('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('+254 712 345 678');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('mpesa');
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [withdrawPin, setWithdrawPin] = useState(['', '', '', '']);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferPin, setTransferPin] = useState(['', '', '', '']);
  const [showEscrows, setShowEscrows] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<number | null>(null);
  const [showConfirmReceived, setShowConfirmReceived] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifTx, setNotifTx] = useState(true);
  const [notifLow, setNotifLow] = useState(true);
  const [notifEscrow, setNotifEscrow] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const balance = 124500;

  const filterTabs = ['All', 'Income', 'Expense', 'Escrow', 'Pending'];
  const dateRanges = ['Today', 'Week', 'Month', 'Year', 'Custom'];

  const filteredTx = mockTransactions.filter(tx => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Income') return tx.type === 'income';
    if (activeFilter === 'Expense') return tx.type === 'expense';
    if (activeFilter === 'Escrow') return tx.type === 'escrow';
    if (activeFilter === 'Pending') return tx.status === 'pending';
    return true;
  });

  // Group transactions by date
  const groupedTx: { date: string; items: Transaction[] }[] = [];
  filteredTx.forEach(tx => {
    const existing = groupedTx.find(g => g.date === tx.date);
    if (existing) existing.items.push(tx);
    else groupedTx.push({ date: tx.date, items: [tx] });
  });

  const renderTxCard = (tx: Transaction) => {
    const icon = getTxIcon(tx.type);
    const isIncome = tx.type === 'income';
    return (
      <TouchableOpacity key={tx.id} style={styles.txCard}>
        <View style={[styles.txIconWrap, { backgroundColor: icon.bg }]}>
          <MaterialIcons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle}>{tx.title}</Text>
          {!!tx.subtitle && <Text style={styles.txSub}>{tx.subtitle}</Text>}
          <Text style={styles.txMeta}>{tx.time} {tx.status !== 'completed' ? `• ${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}` : '• Completed'}</Text>
          {!!tx.ref && <Text style={styles.txRef}>{tx.ref}</Text>}
        </View>
        <Text style={[styles.txAmount, { color: isIncome ? colors.primaryGreen : tx.type === 'escrow' ? colors.orange : colors.red }]}>
          {isIncome ? '+' : tx.type === 'escrow' ? '' : '-'}KES {tx.amount.toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHome = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <MaterialIcons name="account-balance-wallet" size={24} color={colors.primaryGreen} />
          <Text style={styles.balanceLabel}>Total Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>KES {balance.toLocaleString()}</Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.balanceAction} onPress={() => setShowDeposit(true)}>
            <MaterialIcons name="arrow-downward" size={20} color={colors.primaryGreen} />
            <Text style={styles.balanceActionText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balanceAction} onPress={() => setShowWithdraw(true)}>
            <MaterialIcons name="arrow-upward" size={20} color={colors.primaryGreen} />
            <Text style={styles.balanceActionText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balanceAction} onPress={() => setShowTransfer(true)}>
            <MaterialIcons name="swap-horiz" size={20} color={colors.primaryGreen} />
            <Text style={styles.balanceActionText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.balanceAction} onPress={() => setShowHistory(true)}>
            <MaterialIcons name="bar-chart" size={20} color={colors.primaryGreen} />
            <Text style={styles.balanceActionText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialIcons name="trending-up" size={24} color={colors.primaryGreen} />
          <Text style={styles.statValue}>+12%</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="lock-outline" size={24} color={colors.orange} />
          <Text style={styles.statValue}>KES 0</Text>
          <Text style={styles.statLabel}>Escrow</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="verified-user" size={24} color={colors.primaryGreen} />
          <Text style={styles.statValue}>Level 2</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => setShowHistory(true)}>
          <Text style={styles.seeAll}>View All</Text>
        </TouchableOpacity>
      </View>
      {mockTransactions.slice(0, 3).map(renderTxCard)}

      {/* Escrow Summary */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <MaterialIcons name="security" size={20} color={colors.primaryGreen} />
          <Text style={styles.cardTitle}>Active Escrows (2)</Text>
        </View>
        <View style={styles.escrowItem}>
          <MaterialIcons name="fiber-manual-record" size={10} color={colors.mediumGray} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.escrowName}>Maize Seeds - KES 2,500</Text>
            <Text style={styles.escrowStatus}>Awaiting delivery</Text>
          </View>
        </View>
        <View style={styles.escrowItem}>
          <MaterialIcons name="fiber-manual-record" size={10} color={colors.mediumGray} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.escrowName}>Tractor part - KES 15,000</Text>
            <Text style={styles.escrowStatus}>Awaiting inspection</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewEscrowBtn} onPress={() => setShowEscrows(true)}>
          <Text style={styles.viewEscrowText}>View Escrows</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        {[
          { icon: 'phone-iphone' as const, label: 'M-Pesa\nDeposit' },
          { icon: 'credit-card' as const, label: 'Card' },
          { icon: 'account-balance' as const, label: 'Bank' },
          { icon: 'send' as const, label: 'Send to\nUser' },
        ].map((action, i) => (
          <TouchableOpacity key={i} style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <MaterialIcons name={action.icon} size={22} color={colors.primaryGreen} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Wallet Insights */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <MaterialIcons name="bar-chart" size={20} color={colors.primaryGreen} />
          <Text style={styles.cardTitle}>This Month vs Last Month</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Income:</Text>
          <Text style={styles.insightValue}>KES 45,200</Text>
          <Text style={[styles.insightChange, { color: colors.primaryGreen }]}>+15%</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Expenses:</Text>
          <Text style={styles.insightValue}>KES 32,800</Text>
          <Text style={[styles.insightChange, { color: colors.red }]}>-8%</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Savings:</Text>
          <Text style={styles.insightValue}>KES 12,400</Text>
          <Text style={styles.insightChange}></Text>
        </View>
        <TouchableOpacity style={styles.viewReportBtn}>
          <Text style={styles.viewReportText}>View Full Report</Text>
        </TouchableOpacity>
      </View>

      {/* Verification Status */}
      <View style={[styles.card, { marginBottom: 32 }]}>
        <View style={styles.cardHeaderRow}>
          <MaterialIcons name="lock" size={20} color={colors.primaryGreen} />
          <Text style={styles.cardTitle}>Security Level: 2/3</Text>
        </View>
        {[
          { label: 'Phone Verified', done: true },
          { label: 'Email Verified', done: true },
          { label: 'ID Verification', done: false },
        ].map((item, i) => (
          <View key={i} style={styles.verifyRow}>
            <MaterialIcons
              name={item.done ? 'check-circle' : 'radio-button-unchecked'}
              size={20}
              color={item.done ? colors.primaryGreen : colors.borderGray}
            />
            <Text style={[styles.verifyLabel, { color: item.done ? colors.darkCharcoal : colors.mediumGray }]}>{item.label}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeBtnText}>Upgrade to Level 3</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderHistory = () => (
    <Modal visible={showHistory} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowHistory(false)}>
            <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>All Transactions</Text>
          <MaterialIcons name="search" size={24} color={colors.darkCharcoal} />
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, activeFilter === tab && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.filterChipText, activeFilter === tab && styles.filterChipTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date range */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {dateRanges.map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.dateChip, activeDateRange === range && styles.filterChipActive]}
              onPress={() => setActiveDateRange(range)}
            >
              <Text style={[styles.filterChipText, activeDateRange === range && styles.filterChipTextActive]}>{range}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false}>
          {groupedTx.map(group => (
            <View key={group.date}>
              <View style={styles.dateDivider}>
                <Text style={styles.dateDividerText}>{group.date}</Text>
              </View>
              {group.items.map(renderTxCard)}
            </View>
          ))}
          <TouchableOpacity style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>Load More (20 transactions loaded)</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderDeposit = () => (
    <Modal visible={showDeposit} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => { setShowDeposit(false); setDepositStep(0); }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {depositStep === 0 ? 'Deposit Money' : depositStep === 1 ? 'M-Pesa Deposit' : depositStep === 2 ? 'Processing...' : 'Deposit Successful'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {depositStep === 0 && (
          <ScrollView style={styles.formScroll}>
            <Text style={styles.formLabel}>Amount to Deposit</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currency}>KES</Text>
              <TextInput
                style={styles.amountInput}
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.quickAmountsRow}>
              {quickAmounts.map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmountChip, depositAmount === String(amt) && styles.quickAmountActive]}
                  onPress={() => setDepositAmount(String(amt))}
                >
                  <Text style={[styles.quickAmountText, depositAmount === String(amt) && styles.quickAmountTextActive]}>
                    {amt.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Select Payment Method</Text>
            {[
              { id: 'mpesa', icon: 'phone-iphone' as const, title: 'M-Pesa', sub: 'Deposit from mobile money', fee: 'Instant • Fee: KES 0' },
              { id: 'card', icon: 'credit-card' as const, title: 'Card Payment', sub: 'Visa/Mastercard', fee: 'Instant • Fee: 2.5%' },
              { id: 'bank', icon: 'account-balance' as const, title: 'Bank Transfer', sub: 'Equity, KCB, Co-op', fee: '1-2 business days • Free' },
              { id: 'airtel', icon: 'sim-card' as const, title: 'Airtel Money', sub: 'Coming soon', fee: '' },
            ].map(method => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, depositMethod === method.id && styles.methodCardActive]}
                onPress={() => setDepositMethod(method.id)}
              >
                <View style={styles.methodIconWrap}>
                  <MaterialIcons name={method.icon} size={24} color={colors.primaryGreen} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodSub}>{method.sub}</Text>
                  {!!method.fee && <Text style={styles.methodFee}>{method.fee}</Text>}
                </View>
                {depositMethod === method.id && (
                  <MaterialIcons name="radio-button-checked" size={20} color={colors.primaryGreen} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setDepositStep(1)}>
              <Text style={styles.primaryBtnText}>Continue to Deposit</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {depositStep === 1 && (
          <ScrollView style={styles.formScroll}>
            <View style={styles.amountDisplay}>
              <Text style={styles.amountDisplayLabel}>Amount</Text>
              <Text style={styles.amountDisplayValue}>KES {parseInt(depositAmount || '0').toLocaleString()}</Text>
            </View>

            <Text style={styles.formLabel}>M-Pesa Number</Text>
            <TextInput
              style={styles.textInput}
              value={mpesaNumber}
              onChangeText={setMpesaNumber}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.savedNumberBtn}>
              <MaterialIcons name="bookmark" size={16} color={colors.primaryGreen} />
              <Text style={styles.savedNumberText}>Use saved number</Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>
              By continuing, you will receive an STK push prompt on your phone
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setDepositStep(2)}>
              <Text style={styles.primaryBtnText}>Request Payment</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR enter M-Pesa manually</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.manualSteps}>
              {[
                'Go to M-Pesa on your phone',
                'Select "Lipa Na M-Pesa"',
                'Enter Business No: 123456',
                `Enter Account: Your Name`,
                `Enter Amount: KES ${parseInt(depositAmount || '0').toLocaleString()}`,
                'Enter PIN',
              ].map((step, i) => (
                <View key={i} style={styles.manualStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.outlineBtn} onPress={() => setDepositStep(3)}>
              <Text style={styles.outlineBtnText}>I've Completed Payment</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {depositStep === 2 && (
          <View style={styles.statusScreen}>
            <MaterialIcons name="hourglass-empty" size={72} color={colors.orange} />
            <Text style={styles.statusTitle}>Processing Your Deposit</Text>
            <Text style={styles.statusSub}>Please wait while we confirm your payment with M-Pesa...</Text>
            <View style={styles.statusDetails}>
              <Text style={styles.statusDetailText}>Amount: KES {parseInt(depositAmount || '0').toLocaleString()}</Text>
              <Text style={styles.statusDetailText}>Reference: MP-2024-12345</Text>
            </View>
            <Text style={styles.statusNote}>This may take a few seconds</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setDepositStep(3)}>
              <Text style={styles.primaryBtnText}>Check Status</Text>
            </TouchableOpacity>
          </View>
        )}

        {depositStep === 3 && (
          <View style={styles.statusScreen}>
            <View style={styles.successCircle}>
              <MaterialIcons name="check" size={48} color={colors.white} />
            </View>
            <Text style={styles.statusTitle}>Deposit Successful!</Text>
            <Text style={styles.statusSub}>KES {parseInt(depositAmount || '0').toLocaleString()} has been added to your wallet</Text>
            <View style={styles.statusDetails}>
              <Text style={styles.statusDetailText}>New Balance: KES {(balance + parseInt(depositAmount || '0')).toLocaleString()}</Text>
              <Text style={styles.statusDetailText}>Reference: MP-2024-12345</Text>
              <Text style={styles.statusDetailText}>Date: May 15, 2024 2:30 PM</Text>
            </View>
            <TouchableOpacity style={styles.outlineBtn}>
              <MaterialIcons name="receipt" size={18} color={colors.primaryGreen} />
              <Text style={styles.outlineBtnText}>View Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => { setShowDeposit(false); setDepositStep(0); }}>
              <Text style={styles.primaryBtnText}>Back to Wallet</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderWithdraw = () => (
    <Modal visible={showWithdraw} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            if (withdrawStep === 0) { setShowWithdraw(false); }
            else setWithdrawStep(withdrawStep - 1);
          }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {withdrawStep === 0 ? 'Withdraw Money' : withdrawStep === 1 ? 'Confirm Withdrawal' : 'Withdrawal Successful'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {withdrawStep === 0 && (
          <ScrollView style={styles.formScroll}>
            <View style={styles.availableBalance}>
              <Text style={styles.availableLabel}>Available Balance</Text>
              <Text style={styles.availableValue}>KES {balance.toLocaleString()}</Text>
            </View>

            <Text style={styles.formLabel}>Amount to Withdraw</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currency}>KES</Text>
              <TextInput
                style={styles.amountInput}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.quickAmountsRow}>
              {[5000, 10000, 20000, 50000].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmountChip, withdrawAmount === String(amt) && styles.quickAmountActive]}
                  onPress={() => setWithdrawAmount(String(amt))}
                >
                  <Text style={[styles.quickAmountText, withdrawAmount === String(amt) && styles.quickAmountTextActive]}>
                    {amt.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickAmountChip, withdrawAmount === String(balance) && styles.quickAmountActive]}
                onPress={() => setWithdrawAmount(String(balance))}
              >
                <Text style={[styles.quickAmountText, withdrawAmount === String(balance) && styles.quickAmountTextActive]}>Max</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Withdraw To</Text>
            {[
              { id: 'mpesa', icon: 'phone-iphone' as const, title: 'M-Pesa', sub: '+254 712 345 678', fee: 'Instant • Fee: KES 35' },
              { id: 'bank', icon: 'account-balance' as const, title: 'Bank Account', sub: 'Equity Bank - 123XXXXX', fee: '1-2 days • Free' },
            ].map(method => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, withdrawMethod === method.id && styles.methodCardActive]}
                onPress={() => setWithdrawMethod(method.id)}
              >
                <View style={styles.methodIconWrap}>
                  <MaterialIcons name={method.icon} size={24} color={colors.primaryGreen} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodSub}>{method.sub}</Text>
                  <Text style={styles.methodFee}>{method.fee}</Text>
                </View>
                {withdrawMethod === method.id && (
                  <MaterialIcons name="radio-button-checked" size={20} color={colors.primaryGreen} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.methodCard, { borderStyle: 'dashed' }]}>
              <View style={styles.methodIconWrap}>
                <MaterialIcons name="add" size={24} color={colors.primaryGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>Add Withdrawal Method</Text>
                <Text style={styles.methodSub}>New bank or mobile number</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Withdrawal Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={styles.summaryValue}>KES {parseInt(withdrawAmount || '0').toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee:</Text>
                <Text style={styles.summaryValue}>KES 35</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>You receive:</Text>
                <Text style={styles.summaryTotalValue}>KES {Math.max(0, parseInt(withdrawAmount || '0') - 35).toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => setWithdrawStep(1)}>
              <Text style={styles.primaryBtnText}>Confirm Withdrawal</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {withdrawStep === 1 && (
          <ScrollView style={styles.formScroll}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Withdrawal Details</Text>
              {[
                ['Amount:', `KES ${parseInt(withdrawAmount || '0').toLocaleString()}`],
                ['Fee:', 'KES 35'],
                ['You receive:', `KES ${Math.max(0, parseInt(withdrawAmount || '0') - 35).toLocaleString()}`],
                ['To:', 'M-Pesa +254 712 345 678'],
              ].map(([label, value]) => (
                <View key={label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <Text style={styles.summaryValue}>{value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.formLabel}>Enter Wallet PIN</Text>
            <View style={styles.pinRow}>
              {withdrawPin.map((digit, i) => (
                <View key={i} style={styles.pinBox}>
                  <Text style={styles.pinDot}>{digit ? '●' : ''}</Text>
                </View>
              ))}
            </View>
            <View style={styles.numpad}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.numKey, !key && styles.numKeyEmpty]}
                  onPress={() => {
                    if (!key) return;
                    if (key === '⌫') {
                      const newPin = [...withdrawPin];
                      const lastFilled = newPin.map((d, idx) => d ? idx : -1).filter(x => x >= 0).pop();
                      if (lastFilled !== undefined) { newPin[lastFilled] = ''; setWithdrawPin(newPin); }
                    } else {
                      const newPin = [...withdrawPin];
                      const nextEmpty = newPin.findIndex(d => !d);
                      if (nextEmpty >= 0) { newPin[nextEmpty] = key; setWithdrawPin(newPin); }
                    }
                  }}
                >
                  {key === '⌫' ? (
                    <MaterialIcons name="backspace" size={20} color={colors.darkCharcoal} />
                  ) : (
                    <Text style={styles.numKeyText}>{key}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.forgotPin}>
              <Text style={styles.forgotPinText}>Forgot PIN?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setWithdrawStep(2)}>
              <Text style={styles.primaryBtnText}>Confirm</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {withdrawStep === 2 && (
          <View style={styles.statusScreen}>
            <View style={styles.successCircle}>
              <MaterialIcons name="check" size={48} color={colors.white} />
            </View>
            <Text style={styles.statusTitle}>Withdrawal Successful!</Text>
            <Text style={styles.statusSub}>
              KES {Math.max(0, parseInt(withdrawAmount || '0') - 35).toLocaleString()} sent to{'\n'}M-Pesa +254 712 345 678
            </Text>
            <View style={styles.statusDetails}>
              <Text style={styles.statusDetailText}>New Balance: KES {(balance - parseInt(withdrawAmount || '0')).toLocaleString()}</Text>
              <Text style={styles.statusDetailText}>Reference: WD-2024-12345</Text>
              <Text style={styles.statusDetailText}>Date: May 15, 2024 3:15 PM</Text>
            </View>
            <TouchableOpacity style={styles.outlineBtn}>
              <MaterialIcons name="receipt" size={18} color={colors.primaryGreen} />
              <Text style={styles.outlineBtnText}>View Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => { setShowWithdraw(false); setWithdrawStep(0); setWithdrawPin(['','','','']); }}>
              <Text style={styles.primaryBtnText}>Back to Wallet</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderTransfer = () => (
    <Modal visible={showTransfer} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowTransfer(false)}>
            <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Send to User</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.formScroll}>
          <View style={styles.availableBalance}>
            <Text style={styles.availableLabel}>Available Balance</Text>
            <Text style={styles.availableValue}>KES {balance.toLocaleString()}</Text>
          </View>

          <Text style={styles.formLabel}>Recipient</Text>
          <View style={styles.searchInputRow}>
            <MaterialIcons name="search" size={20} color={colors.mediumGray} />
            <TextInput
              style={styles.searchInputField}
              value={transferRecipient}
              onChangeText={setTransferRecipient}
              placeholder="Search by name or @handle"
              placeholderTextColor={colors.mediumGray}
            />
          </View>

          <Text style={styles.formLabel}>Recent Recipients</Text>
          <View style={styles.recipientRow}>
            {[
              { name: 'John', sub: 'Farm' },
              { name: 'Mary', sub: 'Buyer' },
              { name: 'Peter', sub: 'Expert' },
            ].map((r, i) => (
              <TouchableOpacity key={i} style={styles.recipientChip} onPress={() => setTransferRecipient(r.name)}>
                <View style={styles.recipientAvatar}>
                  <MaterialIcons name="person" size={22} color={colors.primaryGreen} />
                </View>
                <Text style={styles.recipientName}>{r.name}</Text>
                <Text style={styles.recipientSub}>{r.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Amount</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currency}>KES</Text>
            <TextInput
              style={styles.amountInput}
              value={transferAmount}
              onChangeText={setTransferAmount}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <Text style={styles.formLabel}>Note (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={transferNote}
            onChangeText={setTransferNote}
            placeholder="For maize seeds..."
            placeholderTextColor={colors.mediumGray}
          />

          <Text style={styles.formLabel}>Enter PIN</Text>
          <View style={styles.pinRow}>
            {transferPin.map((digit, i) => (
              <View key={i} style={styles.pinBox}>
                <Text style={styles.pinDot}>{digit ? '●' : ''}</Text>
              </View>
            ))}
          </View>
          <View style={styles.numpad}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.numKey, !key && styles.numKeyEmpty]}
                onPress={() => {
                  if (!key) return;
                  if (key === '⌫') {
                    const newPin = [...transferPin];
                    const lastFilled = newPin.map((d, idx) => d ? idx : -1).filter(x => x >= 0).pop();
                    if (lastFilled !== undefined) { newPin[lastFilled] = ''; setTransferPin(newPin); }
                  } else {
                    const newPin = [...transferPin];
                    const nextEmpty = newPin.findIndex(d => !d);
                    if (nextEmpty >= 0) { newPin[nextEmpty] = key; setTransferPin(newPin); }
                  }
                }}
              >
                {key === '⌫' ? (
                  <MaterialIcons name="backspace" size={20} color={colors.darkCharcoal} />
                ) : (
                  <Text style={styles.numKeyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowTransfer(false)}>
            <Text style={styles.primaryBtnText}>Send Money</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const escrows = [
    { id: 'MK-2024-12345', item: 'Maize Seeds x2', seller: 'Green Valley Farms', amount: 2500, status: 'Awaiting Delivery', date: 'May 10, 2024' },
    { id: 'MK-2024-12346', item: 'Tractor Part', seller: 'AgriMachinery Ltd', amount: 15000, status: 'Awaiting Inspection', date: 'May 12, 2024' },
  ];

  const renderEscrows = () => (
    <Modal visible={showEscrows} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => { setShowEscrows(false); setSelectedEscrow(null); }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {selectedEscrow !== null ? 'Escrow Details' : 'Active Escrows (2)'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedEscrow === null ? (
          <ScrollView style={styles.formScroll}>
            {escrows.map((escrow, i) => (
              <View key={escrow.id} style={styles.escrowCard}>
                <View style={styles.escrowCardHeader}>
                  <MaterialIcons name="security" size={18} color={colors.primaryGreen} />
                  <Text style={styles.escrowCardTag}>ESCROW HOLD</Text>
                </View>
                <Text style={styles.escrowCardId}>Order #{escrow.id}</Text>
                <View style={styles.escrowCardRow}>
                  <Text style={styles.escrowCardLabel}>Item:</Text>
                  <Text style={styles.escrowCardValue}>{escrow.item}</Text>
                </View>
                <View style={styles.escrowCardRow}>
                  <Text style={styles.escrowCardLabel}>Seller:</Text>
                  <Text style={styles.escrowCardValue}>{escrow.seller}</Text>
                </View>
                <View style={styles.escrowCardRow}>
                  <Text style={styles.escrowCardLabel}>Amount:</Text>
                  <Text style={[styles.escrowCardValue, { color: colors.primaryGreen, fontWeight: '700' }]}>KES {escrow.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.escrowCardRow}>
                  <Text style={styles.escrowCardLabel}>Status:</Text>
                  <Text style={[styles.escrowCardValue, { color: colors.orange }]}>{escrow.status}</Text>
                </View>
                <View style={styles.escrowCardRow}>
                  <Text style={styles.escrowCardLabel}>Date:</Text>
                  <Text style={styles.escrowCardValue}>{escrow.date}</Text>
                </View>
                <View style={styles.escrowCardActions}>
                  <TouchableOpacity style={styles.escrowActionBtn} onPress={() => setSelectedEscrow(i)}>
                    <Text style={styles.escrowActionText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.escrowActionBtn, { backgroundColor: colors.lightGreen }]}>
                    <MaterialIcons name="chat" size={14} color={colors.primaryGreen} />
                    <Text style={[styles.escrowActionText, { color: colors.primaryGreen }]}>Message Seller</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView style={styles.formScroll}>
            <View style={styles.escrowProtectionBanner}>
              <MaterialIcons name="security" size={20} color={colors.primaryGreen} />
              <Text style={styles.escrowProtectionText}>ESCROW PROTECTION ACTIVE</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Information</Text>
              {[
                ['Order #:', escrows[selectedEscrow].id],
                ['Date:', escrows[selectedEscrow].date],
                ['Amount Held:', `KES ${escrows[selectedEscrow].amount.toLocaleString()}`],
              ].map(([label, value]) => (
                <View key={label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <Text style={styles.summaryValue}>{value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Item Details</Text>
              <View style={styles.escrowItemPreview}>
                <View style={styles.escrowItemImage}>
                  <MaterialIcons name="image" size={32} color={colors.mediumGray} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.escrowItemName}>{escrows[selectedEscrow].item}</Text>
                  <Text style={styles.escrowItemSeller}>{escrows[selectedEscrow].seller}</Text>
                  <Text style={styles.escrowItemPrice}>KES {escrows[selectedEscrow].amount.toLocaleString()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Seller Information</Text>
              <Text style={styles.sellerName}>{escrows[selectedEscrow].seller}</Text>
              <View style={styles.verifyRow}>
                <MaterialIcons name="verified" size={16} color={colors.primaryGreen} />
                <Text style={[styles.verifyLabel, { color: colors.primaryGreen }]}>Verified Seller</Text>
              </View>
              <View style={styles.verifyRow}>
                <MaterialIcons name="star" size={16} color={colors.orange} />
                <Text style={styles.verifyLabel}>4.8 (156 sales)</Text>
              </View>
              <TouchableOpacity style={[styles.outlineBtn, { marginTop: 8 }]}>
                <MaterialIcons name="chat" size={16} color={colors.primaryGreen} />
                <Text style={styles.outlineBtnText}>Message Seller</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Escrow Status</Text>
              {[
                { label: 'Payment Held', done: true },
                { label: 'Seller Ships', active: true },
                { label: 'You Receive', done: false },
                { label: 'Funds Released', done: false },
              ].map((step, i) => (
                <View key={i} style={styles.escrowStep}>
                  <MaterialIcons
                    name={step.done ? 'check-circle' : step.active ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={step.done ? colors.primaryGreen : step.active ? colors.orange : colors.borderGray}
                  />
                  <Text style={[styles.escrowStepLabel, step.active && { color: colors.orange }]}>
                    {i + 1}. {step.label}
                    {step.active ? ' \u2192 In Progress' : step.done ? ' \u2713' : ''}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Timeline</Text>
              {[
                'May 10: Payment placed in escrow',
                'May 11: Seller confirmed order',
                'May 12: Seller shipped',
                'Expected: May 15',
              ].map((item, i) => (
                <View key={i} style={styles.timelineRow}>
                  <MaterialIcons name="fiber-manual-record" size={10} color={colors.primaryGreen} />
                  <Text style={styles.timelineText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowConfirmReceived(true)}>
                <MaterialIcons name="check-circle" size={18} color={colors.white} />
                <Text style={styles.primaryBtnText}>Confirm Received</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.orange }]}>
                <MaterialIcons name="warning" size={16} color={colors.orange} />
                <Text style={[styles.outlineBtnText, { color: colors.orange }]}>Report Problem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn}>
                <MaterialIcons name="support-agent" size={16} color={colors.primaryGreen} />
                <Text style={styles.outlineBtnText}>Contact Support</Text>
              </TouchableOpacity>
              <Text style={styles.escrowFootnote}>Funds will be released to seller after you confirm receipt</Text>
            </View>
          </ScrollView>
        )}

        {/* Confirm Received Modal */}
        <Modal visible={showConfirmReceived} animationType="fade" transparent>
          <View style={styles.overlayBg}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Confirm Item Received</Text>
              <Text style={styles.confirmSub}>Have you received this item?</Text>
              <View style={styles.confirmItemRow}>
                <View style={styles.escrowItemImage}>
                  <MaterialIcons name="image" size={28} color={colors.mediumGray} />
                </View>
                <Text style={styles.confirmItemName}>{selectedEscrow !== null ? escrows[selectedEscrow].item : ''}</Text>
              </View>
              <View style={styles.confirmWarning}>
                <MaterialIcons name="warning" size={16} color={colors.orange} />
                <Text style={styles.confirmWarningText}>
                  By confirming, KES {selectedEscrow !== null ? escrows[selectedEscrow].amount.toLocaleString() : ''} will be released to {selectedEscrow !== null ? escrows[selectedEscrow].seller : ''}
                </Text>
              </View>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => { setShowConfirmReceived(false); setSelectedEscrow(null); }}>
                <MaterialIcons name="check" size={18} color={colors.white} />
                <Text style={styles.primaryBtnText}>Yes, I Received It</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.red }]} onPress={() => setShowConfirmReceived(false)}>
                <MaterialIcons name="close" size={16} color={colors.red} />
                <Text style={[styles.outlineBtnText, { color: colors.red }]}>No, I Have an Issue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirmReceived(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );

  const renderSettings = () => (
    <Modal visible={showSettings} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowSettings(false)}>
            <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Wallet Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.formScroll}>
          <Text style={styles.settingsSection}>SECURITY</Text>
          {[
            { icon: 'lock' as const, label: 'Change Wallet PIN', action: true },
            { icon: 'security' as const, label: 'Two-Factor Authentication', toggle: true, value: twoFactor, setter: setTwoFactor },
            { icon: 'fingerprint' as const, label: 'Biometric Login', sub: 'Use fingerprint/face ID', toggle: true, value: biometric, setter: setBiometric },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.settingsRow}>
              <View style={styles.settingsIconWrap}>
                <MaterialIcons name={item.icon} size={20} color={colors.primaryGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                {item.sub && <Text style={styles.settingsSub}>{item.sub}</Text>}
              </View>
              {item.toggle ? (
                <TouchableOpacity
                  style={[styles.toggleBtn, item.value && styles.toggleBtnOn]}
                  onPress={() => item.setter && item.setter(!item.value)}
                >
                  <View style={[styles.toggleKnob, item.value && styles.toggleKnobOn]} />
                </TouchableOpacity>
              ) : (
                <MaterialIcons name="chevron-right" size={20} color={colors.mediumGray} />
              )}
            </TouchableOpacity>
          ))}

          <Text style={styles.settingsSection}>LIMITS</Text>
          <View style={styles.settingsRow}>
            <View style={styles.settingsIconWrap}>
              <MaterialIcons name="swap-vert" size={20} color={colors.primaryGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsLabel}>Daily Transaction Limit</Text>
              <Text style={styles.settingsSub}>KES 200,000 / KES 500,000</Text>
            </View>
            <TouchableOpacity style={styles.increaseLimitBtn}>
              <Text style={styles.increaseLimitText}>Increase</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingsRow}>
            <View style={styles.settingsIconWrap}>
              <MaterialIcons name="account-balance-wallet" size={20} color={colors.primaryGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsLabel}>Single Transaction Max</Text>
              <Text style={styles.settingsSub}>KES 100,000</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.mediumGray} />
          </View>

          <Text style={styles.settingsSection}>NOTIFICATIONS</Text>
          {[
            { label: 'Transaction alerts', value: notifTx, setter: setNotifTx },
            { label: 'Low balance alerts', value: notifLow, setter: setNotifLow },
            { label: 'Escrow updates', value: notifEscrow, setter: setNotifEscrow },
          ].map((item, i) => (
            <View key={i} style={styles.settingsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingsLabel}>{item.label}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, item.value && styles.toggleBtnOn]}
                onPress={() => item.setter(!item.value)}
              >
                <View style={[styles.toggleKnob, item.value && styles.toggleKnobOn]} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <MaterialIcons name="settings" size={24} color={colors.darkCharcoal} />
        </TouchableOpacity>
      </View>

      {renderHome()}
      {renderHistory()}
      {renderDeposit()}
      {renderWithdraw()}
      {renderTransfer()}
      {renderEscrows()}
      {renderSettings()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  // Balance Card
  balanceCard: {
    backgroundColor: colors.lightGreen,
    borderRadius: 24,
    padding: 24,
    margin: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.mediumGray,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceAction: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
    backgroundColor: colors.white,
  },
  balanceActionText: {
    fontSize: 11,
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  // Quick Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    elevation: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 2,
    textAlign: 'center',
  },
  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkCharcoal,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  // Transaction Cards
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  txSub: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  txMeta: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  txRef: {
    fontSize: 11,
    color: colors.primaryGreen,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  escrowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  escrowName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkCharcoal,
  },
  escrowStatus: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  viewEscrowBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewEscrowText: {
    color: colors.primaryGreen,
    fontWeight: '600',
    fontSize: 14,
  },
  // Quick actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    elevation: 2,
  },
  quickActionLabel: {
    fontSize: 11,
    color: colors.darkCharcoal,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Insights
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.mediumGray,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginRight: 8,
  },
  insightChange: {
    fontSize: 13,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  viewReportBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  viewReportText: {
    color: colors.primaryGreen,
    fontWeight: '600',
    fontSize: 14,
  },
  // Verification
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  verifyLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  upgradeBtn: {
    marginTop: 8,
    backgroundColor: colors.primaryGreen,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  // Modal
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  // History
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
    maxHeight: 56,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderGray,
    marginRight: 8,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.darkCharcoal,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    marginRight: 8,
    backgroundColor: colors.white,
  },
  dateDivider: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.lightGray,
  },
  dateDividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mediumGray,
    letterSpacing: 0.5,
  },
  loadMoreBtn: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    color: colors.primaryGreen,
    fontWeight: '600',
    fontSize: 14,
  },
  // Deposit/Withdraw Form
  formScroll: {
    flex: 1,
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 8,
    marginTop: 16,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkCharcoal,
    paddingVertical: 16,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  quickAmountChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.white,
  },
  quickAmountActive: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.primaryGreen,
  },
  quickAmountText: {
    fontSize: 13,
    color: colors.darkCharcoal,
    fontWeight: '500',
  },
  quickAmountTextActive: {
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.borderGray,
  },
  methodCardActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.lightGreen,
  },
  methodIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  methodSub: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  methodFee: {
    fontSize: 12,
    color: colors.primaryGreen,
    marginTop: 2,
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: colors.primaryGreen,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: colors.primaryGreen,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  outlineBtnText: {
    color: colors.primaryGreen,
    fontSize: 15,
    fontWeight: '600',
  },
  amountDisplay: {
    backgroundColor: colors.lightGreen,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  amountDisplayLabel: {
    fontSize: 13,
    color: colors.mediumGray,
  },
  amountDisplayValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.darkCharcoal,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  savedNumberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  savedNumberText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderGray,
  },
  dividerText: {
    fontSize: 12,
    color: colors.mediumGray,
    fontWeight: '500',
  },
  manualSteps: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  manualStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  stepText: {
    fontSize: 14,
    color: colors.darkCharcoal,
    flex: 1,
    lineHeight: 20,
  },
  // Status screens
  statusScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkCharcoal,
    textAlign: 'center',
    marginTop: 8,
  },
  statusSub: {
    fontSize: 15,
    color: colors.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusDetails: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  statusDetailText: {
    fontSize: 14,
    color: colors.darkCharcoal,
    fontWeight: '500',
  },
  statusNote: {
    fontSize: 13,
    color: colors.mediumGray,
    fontStyle: 'italic',
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Withdraw
  availableBalance: {
    backgroundColor: colors.lightGreen,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  availableLabel: {
    fontSize: 13,
    color: colors.mediumGray,
  },
  availableValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginTop: 4,
  },
  // Summary Box
  summaryBox: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.darkCharcoal,
    fontWeight: '500',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  summaryTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  // PIN pad
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  pinBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderGray,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    fontSize: 24,
    color: colors.darkCharcoal,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 4,
  },
  numKey: {
    width: (screenWidth - 64) / 3,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.lightGray,
  },
  numKeyEmpty: {
    backgroundColor: 'transparent',
  },
  numKeyText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  forgotPin: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  forgotPinText: {
    color: colors.primaryGreen,
    fontSize: 14,
    fontWeight: '500',
  },
  // Transfer
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    gap: 8,
  },
  searchInputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.darkCharcoal,
  },
  recipientRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  recipientChip: {
    alignItems: 'center',
    gap: 4,
  },
  recipientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  recipientSub: {
    fontSize: 11,
    color: colors.mediumGray,
  },
  // Escrow
  escrowCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    elevation: 1,
  },
  escrowCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  escrowCardTag: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryGreen,
    letterSpacing: 0.5,
  },
  escrowCardId: {
    fontSize: 13,
    color: colors.mediumGray,
    marginBottom: 10,
  },
  escrowCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  escrowCardLabel: {
    fontSize: 13,
    color: colors.mediumGray,
  },
  escrowCardValue: {
    fontSize: 13,
    color: colors.darkCharcoal,
    fontWeight: '500',
  },
  escrowCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  escrowActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen,
    gap: 4,
  },
  escrowActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  escrowProtectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  escrowProtectionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryGreen,
    letterSpacing: 0.5,
  },
  escrowItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  escrowItemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  escrowItemSeller: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 2,
  },
  escrowItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginTop: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginBottom: 8,
  },
  escrowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  escrowStepLabel: {
    fontSize: 14,
    color: colors.darkCharcoal,
    fontWeight: '500',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timelineText: {
    fontSize: 13,
    color: colors.darkCharcoal,
  },
  escrowFootnote: {
    fontSize: 12,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  // Confirm received modal
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  confirmModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkCharcoal,
    textAlign: 'center',
  },
  confirmSub: {
    fontSize: 15,
    color: colors.mediumGray,
    textAlign: 'center',
  },
  confirmItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 12,
  },
  confirmItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  confirmWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
  },
  confirmWarningText: {
    flex: 1,
    fontSize: 13,
    color: colors.orange,
    lineHeight: 18,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 15,
    color: colors.mediumGray,
    fontWeight: '500',
  },
  // Settings
  settingsSection: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mediumGray,
    letterSpacing: 1,
    paddingHorizontal: 4,
    marginTop: 20,
    marginBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  settingsSub: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  toggleBtn: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.borderGray,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleBtnOn: {
    backgroundColor: colors.primaryGreen,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  increaseLimitBtn: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  increaseLimitText: {
    fontSize: 13,
    color: colors.primaryGreen,
    fontWeight: '600',
  },
});
