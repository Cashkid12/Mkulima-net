import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

interface BulkOrder {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  targetPrice: number;
  currentOrders: number;
  minOrders: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
  participants: number;
  description: string;
  specifications: string[];
  deliveryLocation: string;
  deliveryDate: string;
}

interface ContractFarming {
  id: string;
  farmerName: string;
  cropType: string;
  landSize: string;
  duration: string;
  investment: number;
  expectedYield: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  investorCount: number;
  totalInvestment: number;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  completed: boolean;
  amount: number;
}

export default function BulkBuyerScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState<'bulk' | 'contracts' | 'analytics'>('bulk');
  const [showCreateBulk, setShowCreateBulk] = useState(false);
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [showJoinOrder, setShowJoinOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BulkOrder | null>(null);

  const bulkOrders: BulkOrder[] = [
    {
      id: '1',
      productName: 'Fresh Tomatoes',
      category: 'Vegetables',
      quantity: 500,
      unit: 'kg',
      totalPrice: 25000,
      targetPrice: 50,
      currentOrders: 23,
      minOrders: 50,
      deadline: '2024-02-25',
      status: 'active',
      participants: 23,
      description: 'Fresh, organic tomatoes for processing',
      specifications: ['Organic', 'Firm texture', 'Red color', 'Minimum 60mm diameter'],
      deliveryLocation: 'Nairobi Industrial Area',
      deliveryDate: '2024-02-28'
    },
    {
      id: '2',
      productName: 'Maize Grain',
      category: 'Grains',
      quantity: 2000,
      unit: 'kg',
      totalPrice: 80000,
      targetPrice: 40,
      currentOrders: 45,
      minOrders: 100,
      deadline: '2024-03-01',
      status: 'active',
      participants: 45,
      description: 'High-quality white maize for animal feed',
      specifications: ['White variety', 'Moisture content <14%', 'No aflatoxin', 'Clean'],
      deliveryLocation: 'Mombasa Port',
      deliveryDate: '2024-03-05'
    }
  ];

  const contractFarming: ContractFarming[] = [
    {
      id: '1',
      farmerName: 'John Kamau',
      cropType: 'Avocados',
      landSize: '2 acres',
      duration: '8 months',
      investment: 150000,
      expectedYield: 5000,
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-09-15',
      investorCount: 3,
      totalInvestment: 150000,
      milestones: [
        {
          id: '1',
          name: 'Land Preparation',
          description: 'Soil testing and preparation',
          targetDate: '2024-01-31',
          completed: true,
          amount: 30000
        },
        {
          id: '2',
          name: 'Planting',
          description: 'Seedling planting and irrigation setup',
          targetDate: '2024-02-28',
          completed: true,
          amount: 50000
        },
        {
          id: '3',
          name: 'Maintenance',
          description: 'Regular maintenance and pest control',
          targetDate: '2024-06-30',
          completed: false,
          amount: 40000
        },
        {
          id: '4',
          name: 'Harvesting',
          description: 'Harvest and quality control',
          targetDate: '2024-09-15',
          completed: false,
          amount: 30000
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      case 'pending': return '#FFC107';
      default: return '#666666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const joinOrder = (order: BulkOrder) => {
    setSelectedOrder(order);
    setShowJoinOrder(true);
  };

  const handleJoinOrder = (quantity: number) => {
    Alert.alert(
      'Confirm Order',
      `Are you sure you want to join this order for ${quantity} ${selectedOrder?.unit}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/bulk-orders/join`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authState.token}`,
                },
                body: JSON.stringify({
                  orderId: selectedOrder?.id,
                  quantity
                }),
              });

              if (response.ok) {
                Alert.alert('Success', 'Successfully joined the bulk order!');
                setShowJoinOrder(false);
                setSelectedOrder(null);
              } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to join order');
              }
            } catch (error) {
              console.error('Join order error:', error);
              Alert.alert('Error', error.message || 'Failed to join bulk order');
            }
          }
        }
      ]
    );
  };

  const renderBulkOrders = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Bulk Orders</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateBulk(true)}
        >
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Create Order</Text>
        </TouchableOpacity>
      </View>
      
      {bulkOrders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderTitle}>{order.productName}</Text>
              <Text style={styles.orderCategory}>{order.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Quantity</Text>
              <Text style={styles.statValue}>{order.quantity} {order.unit}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Target Price</Text>
              <Text style={styles.statValue}>KES {order.targetPrice}/{order.unit}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>KES {order.totalPrice.toLocaleString()}</Text>
            </View>
          </View>
          
          <View style={styles.specifications}>
            <Text style={styles.specificationsTitle}>Specifications:</Text>
            <View style={styles.specificationsList}>
              {order.specifications.map((spec, index) => (
                <View key={index} style={styles.specificationItem}>
                  <MaterialIcons name="check-circle" size={12} color="#4CAF50" />
                  <Text style={styles.specificationText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryItem}>
              <MaterialIcons name="location-on" size={16} color="#666666" />
              <Text style={styles.deliveryText}>{order.deliveryLocation}</Text>
            </View>
            <View style={styles.deliveryItem}>
              <MaterialIcons name="calendar-today" size={16} color="#666666" />
              <Text style={styles.deliveryText}>Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</Text>
            </View>
          </View>
          
          <View style={styles.participantsInfo}>
            <View style={styles.participantItem}>
              <MaterialIcons name="people" size={16} color="#666666" />
              <Text style={styles.participantText}>{order.participants} participants</Text>
            </View>
            <View style={styles.participantItem}>
              <MaterialIcons name="access-time" size={16} color="#666666" />
              <Text style={styles.participantText}>Deadline: {new Date(order.deadline).toLocaleDateString()}</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Text style={styles.progressBarLabel}>Order Progress: {order.currentOrders} of {order.minOrders} required</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${Math.min((order.currentOrders / order.minOrders) * 100, 100)}%`,
                    backgroundColor: order.currentOrders >= order.minOrders ? '#4CAF50' : '#2196F3'
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.orderActions}>
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => joinOrder(order)}
            >
              <MaterialIcons name="add-shopping-cart" size={16} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Join Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsButton}>
              <MaterialIcons name="visibility" size={16} color="#1B5E20" />
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderContracts = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Contract Farming Projects</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateContract(true)}
        >
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Create Contract</Text>
        </TouchableOpacity>
      </View>
      
      {contractFarming.map((contract) => (
        <View key={contract.id} style={styles.contractCard}>
          <View style={styles.contractHeader}>
            <View style={styles.contractIcon}>
              <MaterialIcons name="agriculture" size={24} color="#1B5E20" />
            </View>
            <View style={styles.contractInfo}>
              <Text style={styles.contractTitle}>{contract.cropType}</Text>
              <Text style={styles.contractFarmer}>Farmer: {contract.farmerName}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(contract.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
                {getStatusText(contract.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.contractStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Land Size</Text>
              <Text style={styles.statValue}>{contract.landSize}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{contract.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Investment</Text>
              <Text style={styles.statValue}>KES {contract.investment.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expected Yield</Text>
              <Text style={styles.statValue}>{contract.expectedYield.toLocaleString()} kg</Text>
            </View>
          </View>
          
          <View style={styles.milestonesSection}>
            <Text style={styles.milestonesTitle}>Project Milestones</Text>
            <View style={styles.milestonesList}>
              {contract.milestones.map((milestone) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <View style={[
                    styles.milestoneIcon,
                    { backgroundColor: milestone.completed ? '#4CAF5020' : '#CCCCCC20' }
                  ]}>
                    <MaterialIcons 
                      name={milestone.completed ? "check-circle" : "schedule"} 
                      size={16} 
                      color={milestone.completed ? "#4CAF50" : "#CCCCCC"} 
                    />
                  </View>
                  <View style={styles.milestoneInfo}>
                    <Text style={styles.milestoneName}>{milestone.name}</Text>
                    <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                    <Text style={styles.milestoneDate}>Target: {new Date(milestone.targetDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.milestoneAmount}>
                    <Text style={styles.milestoneAmountText}>KES {milestone.amount.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.contractActions}>
            <TouchableOpacity style={styles.investButton}>
              <MaterialIcons name="trending-up" size={16} color="#FFFFFF" />
              <Text style={styles.investButtonText}>Invest Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsButton}>
              <MaterialIcons name="visibility" size={16} color="#1B5E20" />
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.investorsInfo}>
            <Text style={styles.investorsText}>{contract.investorCount} investors • KES {contract.totalInvestment.toLocaleString()} raised</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Bulk Trading Analytics</Text>
      
      <View style={styles.analyticsCards}>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIcon}>
            <MaterialIcons name="shopping-cart" size={24} color="#4CAF50" />
          </View>
          <View style={styles.analyticsInfo}>
            <Text style={styles.analyticsValue}>127</Text>
            <Text style={styles.analyticsLabel}>Total Orders</Text>
          </View>
          <Text style={styles.analyticsChange}>+12%</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIcon}>
            <MaterialIcons name="monetization-on" size={24} color="#2196F3" />
          </View>
          <View style={styles.analyticsInfo}>
            <Text style={styles.analyticsValue}>KES 2.4M</Text>
            <Text style={styles.analyticsLabel}>Total Value</Text>
          </View>
          <Text style={styles.analyticsChange}>+18%</Text>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIcon}>
            <MaterialIcons name="people" size={24} color="#9C27B0" />
          </View>
          <View style={styles.analyticsInfo}>
            <Text style={styles.analyticsValue}>89</Text>
            <Text style={styles.analyticsLabel}>Active Partners</Text>
          </View>
          <Text style={styles.analyticsChange}>+5</Text>
        </View>
      </View>
      
      <View style={styles.popularCategories}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        
        {[
          { category: 'Vegetables', orders: 45, value: 'KES 890,000' },
          { category: 'Grains', orders: 32, value: 'KES 650,000' },
          { category: 'Fruits', orders: 28, value: 'KES 420,000' },
          { category: 'Dairy', orders: 22, value: 'KES 340,000' }
        ].map((item, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryRank}>
              <Text style={styles.categoryRankText}>{index + 1}</Text>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{item.category}</Text>
              <Text style={styles.categoryOrders}>{item.orders} orders</Text>
            </View>
            <View style={styles.categoryValue}>
              <Text style={styles.categoryValueText}>{item.value}</Text>
              <Text style={styles.categoryTotal}>Total value</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bulk Buyer & Contract Farming</Text>
        <Text style={styles.headerSubtitle}>Access bulk purchasing opportunities and invest in contract farming</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bulk' && styles.activeTab]}
          onPress={() => setActiveTab('bulk')}
        >
          <MaterialIcons 
            name="shopping-cart" 
            size={20} 
            color={activeTab === 'bulk' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'bulk' && styles.activeTabText]}>
            Bulk Orders
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contracts' && styles.activeTab]}
          onPress={() => setActiveTab('contracts')}
        >
          <MaterialIcons 
            name="assignment" 
            size={20} 
            color={activeTab === 'contracts' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'contracts' && styles.activeTabText]}>
            Contracts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <MaterialIcons 
            name="trending-up" 
            size={20} 
            color={activeTab === 'analytics' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'bulk' && renderBulkOrders()}
      {activeTab === 'contracts' && renderContracts()}
      {activeTab === 'analytics' && renderAnalytics()}

      {/* Join Order Modal */}
      {showJoinOrder && selectedOrder && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Bulk Order</Text>
            <Text style={styles.modalSubtitle}>Join the order for {selectedOrder.productName}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              keyboardType="numeric"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowJoinOrder(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => handleJoinOrder(10)} // Default to 10 units
              >
                <Text style={styles.confirmButtonText}>Join Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Create Bulk Order Modal */}
      {showCreateBulk && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Bulk Order</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Product Name (e.g., Fresh Tomatoes)"
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="Quantity"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.flex1, { marginLeft: 10 }]}
                placeholder="Unit (kg, tons, etc.)"
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Target Price per Unit"
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Minimum Orders Required"
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Deadline (YYYY-MM-DD)"
              keyboardType="default"
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Product Specifications..."
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateBulk(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  setShowCreateBulk(false);
                  Alert.alert('Success', 'Bulk order created successfully!');
                }}
              >
                <Text style={styles.confirmButtonText}>Create Order</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#1B5E20',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 15,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  orderCategory: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  specifications: {
    marginBottom: 12,
  },
  specificationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  specificationsList: {
    marginBottom: -4,
  },
  specificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  specificationText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  deliveryInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  deliveryText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  participantsInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  participantText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBarLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.45,
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.45,
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contractIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contractInfo: {
    flex: 1,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  contractFarmer: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  contractStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  milestonesSection: {
    marginBottom: 15,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  milestonesList: {
    marginBottom: -8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  milestoneDescription: {
    fontSize: 12,
    color: '#666666',
  },
  milestoneDate: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  milestoneAmount: {
    alignItems: 'flex-end',
  },
  milestoneAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  contractActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  investButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.45,
    justifyContent: 'center',
  },
  investButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  investorsInfo: {
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  investorsText: {
    fontSize: 12,
    color: '#1976D2',
    textAlign: 'center',
  },
  analyticsCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  analyticsIcon: {
    marginBottom: 8,
  },
  analyticsInfo: {
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666666',
  },
  analyticsChange: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  popularCategories: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  categoryOrders: {
    fontSize: 12,
    color: '#666666',
  },
  categoryValue: {
    alignItems: 'flex-end',
  },
  categoryValueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  categoryTotal: {
    fontSize: 11,
    color: '#666666',
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
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  flex1: {
    flex: 1,
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