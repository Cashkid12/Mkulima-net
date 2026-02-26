import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function PortfolioScreen() {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for portfolio
  const portfolioData = {
    totalAssets: 1250000,
    totalSales: 850000,
    totalInvestments: 450000,
    monthlyGrowth: 12.5,
    cropsInProduction: [
      { id: 1, name: 'Maize', stage: 'Harvesting', progress: 95, estimatedValue: 150000 },
      { id: 2, name: 'Tomatoes', stage: 'Flowering', progress: 65, estimatedValue: 85000 },
      { id: 3, name: 'Dairy Cattle', stage: 'Milking', progress: 100, estimatedValue: 320000 },
    ],
    recentSales: [
      { id: 1, product: 'Maize Bags', quantity: '50 bags', amount: 75000, date: '2024-01-15' },
      { id: 2, product: 'Dairy Milk', quantity: '200L', amount: 40000, date: '2024-01-12' },
      { id: 3, product: 'Tomatoes', quantity: '100kg', amount: 25000, date: '2024-01-10' },
    ],
    investments: [
      { id: 1, name: 'Tractor Purchase', amount: 800000, status: 'Completed', date: '2024-01-01' },
      { id: 2, name: 'Fertilizer Investment', amount: 150000, status: 'Active', date: '2024-01-10' },
    ]
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Asset Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Assets</Text>
          <Text style={styles.summaryValue}>KSh {portfolioData.totalAssets.toLocaleString()}</Text>
          <View style={styles.trendIndicator}>
            <MaterialIcons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.trendText}>+{portfolioData.monthlyGrowth}% this month</Text>
          </View>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Sales</Text>
          <Text style={styles.summaryValue}>KSh {portfolioData.totalSales.toLocaleString()}</Text>
          <View style={styles.trendIndicator}>
            <MaterialIcons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.trendText}>+8.2% from last month</Text>
          </View>
        </View>
      </View>

      {/* Crops in Production */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crops in Production</Text>
        <FlatList
          data={portfolioData.cropsInProduction}
          renderItem={({ item }) => (
            <View style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <Text style={styles.cropName}>{item.name}</Text>
                <Text style={styles.cropStage}>{item.stage}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${item.progress}%` },
                      { backgroundColor: item.progress >= 90 ? '#10B981' : item.progress >= 50 ? '#F59E0B' : '#EF4444' }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{item.progress}%</Text>
              </View>
              <Text style={styles.cropValue}>Est. Value: KSh {item.estimatedValue.toLocaleString()}</Text>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );

  const renderSales = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Sales</Text>
      <FlatList
        data={portfolioData.recentSales}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionProduct}>{item.product}</Text>
              <Text style={styles.transactionAmount}>KSh {item.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionQuantity}>{item.quantity}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderInvestments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Investments</Text>
      <FlatList
        data={portfolioData.investments}
        renderItem={({ item }) => (
          <View style={styles.investmentCard}>
            <View style={styles.investmentHeader}>
              <Text style={styles.investmentName}>{item.name}</Text>
              <Text style={[
                styles.investmentStatus,
                { color: item.status === 'Completed' ? '#10B981' : '#F59E0B' }
              ]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.investmentAmount}>KSh {item.amount.toLocaleString()}</Text>
            <Text style={styles.investmentDate}>{item.date}</Text>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return renderOverview();
      case 'sales':
        return renderSales();
      case 'investments':
        return renderInvestments();
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <Text style={styles.headerSubtitle}>Track your agricultural assets</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <MaterialIcons 
            name="bar-chart" 
            size={20} 
            color={activeTab === 'overview' ? '#1B5E20' : '#666666'} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'overview' && styles.activeTabText
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'sales' && styles.activeTab]}
          onPress={() => setActiveTab('sales')}
        >
          <MaterialIcons 
            name="receipt" 
            size={20} 
            color={activeTab === 'sales' ? '#1B5E20' : '#666666'} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'sales' && styles.activeTabText
          ]}>
            Sales
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'investments' && styles.activeTab]}
          onPress={() => setActiveTab('investments')}
        >
          <MaterialIcons 
            name="trending-up" 
            size={20} 
            color={activeTab === 'investments' ? '#1B5E20' : '#666666'} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'investments' && styles.activeTabText
          ]}>
            Investments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#1B5E20',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    flex: 0.48,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 16,
  },
  cropCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  cropStage: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    width: 30,
  },
  cropValue: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionQuantity: {
    fontSize: 14,
    color: '#666666',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999999',
  },
  investmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  investmentStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  investmentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  investmentDate: {
    fontSize: 12,
    color: '#999999',
  },
});