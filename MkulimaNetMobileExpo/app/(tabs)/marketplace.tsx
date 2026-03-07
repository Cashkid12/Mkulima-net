import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';

// ═══════════════════════════════════════════════════════════
// COLOR SYSTEM - MKULIMANET MARKETPLACE SPECIFICATION
// ═══════════════════════════════════════════════════════════
const COLORS = {
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
  gold: '#FFB74D',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
type Category = 'All' | 'Livestock' | 'Crops' | 'Machinery' | 'Seeds' | 'Tools' | 'Fertilizer' | 'Poultry' | 'Dairy' | 'Near Me';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  location: string;
  distance?: string;
  image: string;
  images?: string[];
  seller: {
    name: string;
    verified: boolean;
    rating: number;
    reviews: number;
    online?: boolean;
  };
  stock?: number;
  featured?: boolean;
  discount?: number;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

// ═══════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════
const CATEGORIES: Category[] = ['All', 'Livestock', 'Crops', 'Machinery', 'Seeds', 'Tools', 'Fertilizer', 'Poultry', 'Dairy', 'Near Me'];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Maize Seeds - Hybrid',
    price: 2500,
    originalPrice: 3000,
    description: 'High-yield hybrid maize seeds, certified',
    category: 'Crops',
    location: 'Nakuru',
    distance: '2km',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    seller: {
      name: 'John Kamau',
      verified: true,
      rating: 4.8,
      reviews: 124,
      online: true,
    },
    stock: 150,
    featured: true,
    discount: 17,
  },
  {
    id: '2',
    name: 'Fresian Dairy Cow',
    price: 45000,
    description: 'Healthy Fresian dairy cow, vaccinated, 3 years old',
    category: 'Livestock',
    location: 'Nyandarua',
    distance: '15km',
    image: 'https://images.unsplash.com/photo-1546445317-29f4bb4637a8?w=400',
    seller: {
      name: 'Mary Wanjiru',
      verified: true,
      rating: 4.9,
      reviews: 87,
      online: false,
    },
    featured: true,
  },
  {
    id: '3',
    name: 'Farm Plow',
    price: 8500,
    description: 'Heavy-duty farm plow for tractor',
    category: 'Machinery',
    location: 'Eldoret',
    distance: '45km',
    image: 'https://images.unsplash.com/photo-1592860849027-4b9a88f6e5b8?w=400',
    seller: {
      name: 'Agro Equipment Ltd',
      verified: true,
      rating: 4.7,
      reviews: 203,
      online: true,
    },
    stock: 5,
  },
  {
    id: '4',
    name: 'Organic Fertilizer 50kg',
    price: 1800,
    description: 'Organic fertilizer for all crops',
    category: 'Fertilizer',
    location: 'Nyeri',
    distance: '8km',
    image: 'https://images.unsplash.com/photo-1628352081507-2955e8a753e5?w=400',
    seller: {
      name: 'Peter Mwangi',
      verified: false,
      rating: 4.3,
      reviews: 45,
      online: true,
    },
    stock: 200,
  },
  {
    id: '5',
    name: 'Dorper Sheep',
    price: 12000,
    description: 'Pure breed Dorper sheep, 1 year old',
    category: 'Livestock',
    location: 'Kajiado',
    distance: '22km',
    image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da74?w=400',
    seller: {
      name: 'Sarah Leparyio',
      verified: true,
      rating: 4.6,
      reviews: 34,
      online: false,
    },
  },
  {
    id: '6',
    name: 'Watering Can 20L',
    price: 850,
    description: 'Durable plastic watering can',
    category: 'Tools',
    location: 'Kiambu',
    distance: '5km',
    image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400',
    seller: {
      name: 'Farm Supplies Kenya',
      verified: true,
      rating: 4.5,
      reviews: 156,
      online: true,
    },
    stock: 80,
  },
];

export default function MarketplaceScreen() {
  const { user } = useUser();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Filter products by category and search
  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: product.id, product, quantity: 1 }];
    });
    Alert.alert('Added to Cart', `${product.name} added successfully!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Marketplace</Text>
      </View>
      <TouchableOpacity 
        style={styles.cartButton}
        onPress={() => setShowCart(true)}
      >
        <Ionicons name="cart-outline" size={24} color={COLORS.primaryGreen} />
        {cartItemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderLocationBar = () => (
    <View style={styles.locationBar}>
      <Ionicons name="location" size={18} color={COLORS.primaryGreen} />
      <Text style={styles.locationText}>Nairobi, Kenya</Text>
      <TouchableOpacity>
        <Text style={styles.changeLocation}>Change</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={22} color={COLORS.primaryGreen} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search crops, livestock, seeds..."
        placeholderTextColor={COLORS.mediumGray}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity>
        <Ionicons name="mic" size={22} color={COLORS.primaryGreen} />
      </TouchableOpacity>
    </View>
  );

  const renderCategories = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
    >
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            selectedCategory === category && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles.categoryChipText,
            selectedCategory === category && styles.categoryChipTextActive
          ]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderProductCard = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={() => toggleWishlist(item.id)}
      >
        <Ionicons 
          name={wishlist.includes(item.id) ? 'heart' : 'heart-outline'} 
          size={22} 
          color={wishlist.includes(item.id) ? COLORS.red : COLORS.mediumGray} 
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      {item.discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>-{item.discount}%</Text>
        </View>
      )}

      {item.seller.verified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>KES {item.price.toLocaleString()}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>KES {item.originalPrice.toLocaleString()}</Text>
          )}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.mediumGray} />
          <Text style={styles.locationText}>{item.location} • {item.distance}</Text>
        </View>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={COLORS.gold} />
          <Text style={styles.ratingText}>{item.seller.rating} ({item.seller.reviews})</Text>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}
        >
          <Ionicons name="cart-outline" size={18} color={COLORS.primaryGreen} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCartModal = () => (
    <Modal
      visible={showCart}
      animationType="slide"
      onRequestClose={() => setShowCart(false)}
    >
      <SafeAreaView style={styles.cartModalContainer}>
        <View style={styles.cartHeader}>
          <TouchableOpacity onPress={() => setShowCart(false)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.darkCharcoal} />
          </TouchableOpacity>
          <Text style={styles.cartTitle}>Shopping Cart ({cartItemCount})</Text>
          <View style={{ width: 24 }} />
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={80} color={COLORS.mediumGray} />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <TouchableOpacity 
              style={styles.continueShoppingButton}
              onPress={() => setShowCart(false)}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cart}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.product.image }} style={styles.cartProductImage} />
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartProductName}>{item.product.name}</Text>
                  <Text style={styles.cartProductPrice}>KES {item.product.price.toLocaleString()}</Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Ionicons name="trash-outline" size={22} color={COLORS.red} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {cart.length > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>KES {cartTotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderLocationBar()}
      {renderSearchBar()}
      {renderCategories()}

      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productsRow}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />

      {renderCartModal()}
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkCharcoal,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    marginLeft: 6,
    flex: 1,
  },
  changeLocation: {
    fontSize: 14,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 30,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkCharcoal,
    marginLeft: 12,
    marginRight: 8,
  },
  categoriesContainer: {
    maxHeight: 40,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: 16,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  productsList: {
    padding: 16,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.lightGray,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  verifiedText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 3,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkCharcoal,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  originalPrice: {
    fontSize: 13,
    color: COLORS.mediumGray,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginLeft: 4,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    borderRadius: 8,
    paddingVertical: 6,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    marginLeft: 4,
  },
  cartModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkCharcoal,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCartText: {
    fontSize: 18,
    color: COLORS.mediumGray,
    marginTop: 24,
    marginBottom: 32,
  },
  continueShoppingButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  continueShoppingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  cartProductImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkCharcoal,
    marginBottom: 4,
  },
  cartProductPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkCharcoal,
    marginHorizontal: 12,
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGray,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkCharcoal,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  checkoutButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
