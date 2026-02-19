import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  seller: {
    name: string;
  };
  timeAgo: string;
}

interface Tab {
  id: string;
  label: string;
}

export default function MarketplaceScreen() {
  const { authState } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const tabs: Tab[] = [
    { id: 'all', label: 'All' },
    { id: 'crops', label: 'Crops' },
    { id: 'livestock', label: 'Livestock' },
    { id: 'agrovet', label: 'Agrovet' },
  ];

  useEffect(() => {
    loadProducts();
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      // Simulate API call to get products
      const response = await fetch(`http://localhost:5000/api/products?category=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (response.ok) {
        const data: Product[] = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>KSh {item.price.toLocaleString()}</Text>
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{item.seller.name}</Text>
          <Text style={styles.postTime}>Posted {item.timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#1B5E20',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sellerName: {
    fontSize: 14,
    color: '#666666',
  },
  postTime: {
    fontSize: 12,
    color: '#999999',
  },
});