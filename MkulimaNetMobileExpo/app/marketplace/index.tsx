import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured?: boolean;
  category: string;
  condition: 'New' | 'Like New' | 'Used' | 'Refurbished';
  quantity: number;
}

export default function MarketplaceScreen() {
  const [cartItems, setCartItems] = useState(3);
  const [walletBalance, setWalletBalance] = useState(2500);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Professional color palette
  const colors = {
    primaryGreen: '#2E7D32',
    secondaryGreen: '#4CAF50',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F7FA',
    primaryText: '#222222',
    secondaryText: '#424242',
    metadataText: '#757575',
    lightText: '#BDBDBD',
    borderColor: '#E0E0E0',
    error: '#F44336',
    success: '#4CAF50',
    discount: '#F57C00',
  };

  const categories = [
    { id: 'livestock', name: 'Livestock', icon: 'agriculture', emoji: '🐄' },
    { id: 'crops', name: 'Crops', icon: 'grass', emoji: '🌽' },
    { id: 'machinery', name: 'Machinery', icon: 'construction', emoji: '🚜' },
    { id: 'fertilizer', name: 'Fertilizer', icon: 'science', emoji: '🧪' },
    { id: 'poultry', name: 'Poultry', icon: 'egg', emoji: '🐓' },
    { id: 'dairy', name: 'Dairy', icon: 'local-drink', emoji: '🥛' },
    { id: 'seeds', name: 'Seeds', icon: 'spa', emoji: '🌱' },
    { id: 'tools', name: 'Tools', icon: 'build', emoji: '🛠️' },
    { id: 'transport', name: 'Transport', icon: 'local-shipping', emoji: '🚛' },
  ];

  const mockProducts: Product[] = [
    {
      id: 1,
      title: 'High-Yield Maize Seeds - 5kg Pack',
      price: 4500,
      originalPrice: 5500,
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=300',
      seller: 'GreenLeaf Farms',
      location: 'Nakuru',
      distance: '2km away',
      rating: 4.5,
      reviewCount: 24,
      isVerified: true,
      isFeatured: true,
      category: 'seeds',
      condition: 'New',
      quantity: 50
    },
    {
      id: 2,
      title: 'Used Tractor - John Deere 2023 Model',
      price: 850000,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300',
      seller: 'Farm Machinery Ltd',
      location: 'Nakuru',
      distance: '5km away',
      rating: 4.8,
      reviewCount: 15,
      isVerified: true,
      category: 'machinery',
      condition: 'Used',
      quantity: 1
    },
    {
      id: 3,
      title: 'Organic Chicken Feed - 50kg Bag',
      price: 2800,
      originalPrice: 3200,
      image: 'https://images.unsplash.com/photo-1567029547965-9c0b01b6b33a?w=300',
      seller: 'AgroVet Supplies',
      location: 'Nakuru',
      distance: '1km away',
      rating: 4.2,
      reviewCount: 32,
      isVerified: true,
      category: 'fertilizer',
      condition: 'New',
      quantity: 100
    },
    {
      id: 4,
      title: 'Dairy Cow - Fresh Jersey Heifer',
      price: 120000,
      image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300',
      seller: 'Dairy Valley Farm',
      location: 'Naivasha',
      distance: '45km away',
      rating: 4.7,
      reviewCount: 8,
      isVerified: true,
      category: 'livestock',
      condition: 'New',
      quantity: 5
    }
  ];

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.white }]}>
      <View style={styles.locationContainer}>
        <MaterialIcons name="location-on" size={16} color={colors.primaryGreen} />
        <Text style={[styles.locationText, { color: colors.primaryText }]}>Nakuru, Kenya</Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={colors.primaryGreen} />
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.walletButton}>
          <View style={[styles.walletPill, { backgroundColor: colors.lightGreen }]}>
            <Text style={[styles.walletText, { color: colors.primaryGreen }]}>
              KES {walletBalance.toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cartButton}>
          <MaterialIcons name="shopping-cart" size={24} color={colors.primaryGreen} />
          {cartItems > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primaryGreen }]}>
              <Text style={styles.cartBadgeText}>{cartItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: colors.lightGray }]}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={colors.secondaryGreen} 
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.primaryText }]}
          placeholder="Search tractors, seeds, livestock..."
          placeholderTextColor={colors.lightText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="tune" size={20} color={colors.primaryGreen} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.voiceSearch}>
          <MaterialIcons name="mic" size={20} color={colors.primaryGreen} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategories = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            { backgroundColor: colors.lightGreen }
          ]}
          onPress={() => setActiveCategory(category.id)}
        >
          <Text style={[styles.categoryEmoji, { color: colors.primaryGreen }]}>
            {category.emoji}
          </Text>
          <Text style={[styles.categoryText, { color: colors.primaryText }]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFlashSale = () => (
    <View style={[styles.flashSaleBanner, { backgroundColor: colors.primaryGreen }]}>
      <View style={styles.flashSaleContent}>
        <View>
          <Text style={[styles.flashSaleTitle, { color: colors.white }]}>
            ⚡ Flash Sale - 24h only
          </Text>
          <Text style={[styles.flashSaleTimer, { color: colors.lightGreen }]}>
            Ends in 12:45:30
          </Text>
        </View>
        <TouchableOpacity style={[styles.shopNowButton, { borderColor: colors.white }]}>
          <Text style={[styles.shopNowText, { color: colors.white }]}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductCard = ({ item }: { item: Product }) => {
    const discount = item.originalPrice 
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity style={[styles.productCard, { backgroundColor: colors.white }]}>
        {/* Wishlist Button */}
        <TouchableOpacity style={styles.wishlistButton}>
          <MaterialIcons name="favorite-border" size={20} color={colors.metadataText} />
        </TouchableOpacity>
        
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.lightGray }]}>
            <MaterialIcons name="image" size={32} color={colors.metadataText} />
          </View>
          {item.isFeatured && (
            <View style={[styles.featuredBadge, { backgroundColor: colors.primaryGreen }]}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>
        
        {/* Seller Verification */}
        <View style={styles.sellerInfo}>
          <Text style={[styles.sellerName, { color: colors.primaryText }]} numberOfLines={1}>
            {item.seller}
          </Text>
          <View style={styles.verificationContainer}>
            {item.isVerified && (
              <MaterialIcons name="verified" size={14} color={colors.primaryGreen} />
            )}
            <Text style={[styles.sellerStatus, { color: colors.metadataText }]}>
              {item.isVerified ? 'Verified' : 'Seller'}
            </Text>
          </View>
        </View>
        
        {/* Product Title */}
        <Text style={[styles.productTitle, { color: colors.primaryText }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={[styles.currentPrice, { color: colors.primaryGreen }]}>
            KES {item.price.toLocaleString()}
          </Text>
          {item.originalPrice && (
            <Text style={[styles.originalPrice, { color: colors.metadataText }]}>
              KES {item.originalPrice.toLocaleString()}
            </Text>
          )}
        </View>
        
        {discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.discount }]}>
            <Text style={styles.discountText}>{discount}% off</Text>
          </View>
        )}
        
        {/* Location and Rating */}
        <View style={styles.infoRow}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={12} color={colors.secondaryGreen} />
            <Text style={[styles.distanceText, { color: colors.metadataText }]} numberOfLines={1}>
              {item.distance}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={12} color={colors.secondaryGreen} />
            <Text style={[styles.ratingText, { color: colors.metadataText }]}>
              {item.rating} ({item.reviewCount})
            </Text>
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: colors.primaryGreen }]}
          >
            <Text style={[styles.actionText, { color: colors.primaryGreen }]}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primaryGreen }]}
          >
            <Text style={[styles.actionText, { color: colors.white }]}>Message</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>{title}</Text>
      <TouchableOpacity>
        <Text style={[styles.seeAllText, { color: colors.primaryGreen }]}>See all</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      {renderHeader()}
      {renderSearchBar()}
      {renderCategories()}
      
      <FlatList
        data={mockProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        ListHeaderComponent={
          <View>
            {renderFlashSale()}
            {renderSectionHeader('Featured Products')}
            {renderSectionHeader('Near You')}
            {renderSectionHeader('Verified Sellers')}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletButton: {
    marginRight: 16,
  },
  walletPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  walletText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    marginHorizontal: 12,
    padding: 4,
  },
  voiceSearch: {
    padding: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 24,
  },
  categoryItem: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  flashSaleBanner: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  flashSaleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flashSaleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  flashSaleTimer: {
    fontSize: 14,
    fontWeight: '500',
  },
  shopNowButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  shopNowText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productCard: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  sellerInfo: {
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});