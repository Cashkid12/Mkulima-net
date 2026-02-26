import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, SafeAreaView, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function MarketplaceScreen() {
  const { authState } = useAuth();
  const [products, setProducts] = useState([
    {
      id: 1,
      title: 'Fresh Tomatoes',
      description: 'Organically grown, farm fresh tomatoes',
      price: 350,
      unit: 'per kg',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      seller: 'John Kariuki',
      location: 'Nakuru County',
      rating: 4.8,
      reviews: 24,
      category: 'Crops',
      inStock: true
    },
    {
      id: 2,
      title: 'Holstein Friesian Calf',
      description: 'Healthy 6-month-old dairy calf',
      price: 45000,
      unit: 'per piece',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      seller: 'Mary Wanjiru',
      location: 'Kiambu County',
      rating: 4.9,
      reviews: 18,
      category: 'Livestock',
      inStock: true
    },
    {
      id: 3,
      title: 'DAP Fertilizer',
      description: 'Quality DAP fertilizer for crop production',
      price: 2800,
      unit: 'per 50kg bag',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      seller: 'Agrovet Supplies',
      location: 'Nairobi County',
      rating: 4.7,
      reviews: 42,
      category: 'Equipment',
      inStock: true
    }
  ]);
  
  const [categories] = useState(['All', 'Crops', 'Livestock', 'Equipment', 'Seeds', 'Fertilizers']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => {}}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.productPrice}>KSh {item.price.toLocaleString()}</Text>
        </View>
        <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.productUnit}>{item.unit}</Text>
        
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{item.seller}</Text>
          <Text style={styles.sellerLocation}>{item.location}</Text>
        </View>
        
        <View style={styles.ratingSection}>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
          </View>
          <View style={styles.stockStatus}>
            <MaterialIcons 
              name={item.inStock ? "check-circle" : "cancel"} 
              size={14} 
              color={item.inStock ? "#10B981" : "#EF4444"} 
            />
            <Text style={[styles.stockText, { color: item.inStock ? '#10B981' : '#EF4444' }]}>
              {item.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.categoryButton, 
                selectedCategory === item && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text 
                style={[
                  styles.categoryText, 
                  selectedCategory === item && styles.selectedCategoryText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="sentiment-dissatisfied" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>Try changing your search or category</Text>
          </View>
        }
      />

      {/* Add Product Button */}
      <TouchableOpacity style={styles.addProductButton}>
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addProductText}>Add Product</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#1B5E20',
  },
  categoryText: {
    fontSize: 12,
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Extra padding to account for floating button
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  productDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  productUnit: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 12,
  },
  sellerInfo: {
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  sellerLocation: {
    fontSize: 12,
    color: '#666666',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#666666',
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  addProductButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1B5E20',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addProductText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});