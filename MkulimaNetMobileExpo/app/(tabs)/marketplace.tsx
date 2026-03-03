import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Color System - Marketplace Mobile Spec
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

const { width: screenWidth } = Dimensions.get('window');

// Types
type ProductCategory = 'livestock' | 'crops' | 'machinery' | 'seeds' | 'tools' | 'fertilizer' | 'all';
type ProductCondition = 'new' | 'like_new' | 'used_good' | 'used_fair';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: ProductCategory;
  condition?: ProductCondition;
  location: string;
  distance?: string;
  image: string;
  images?: string[];
  seller: {
    name: string;
    verified: boolean;
    rating: number;
    sales?: number;
    online?: boolean;
  };
  stock?: number;
  specifications?: Record<string, string>;
  reviews?: number;
  featured?: boolean;
}

interface FilterOptions {
  category: ProductCategory;
  location: string;
  distance: number;
  minPrice: number;
  maxPrice: number;
  condition: string[];
  sellerType: string[];
  rating: number;
  sortBy: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface Address {
  id: string;
  name: string;
  street: string;
  phone: string;
  isDefault: boolean;
}

// Mock Data
const mockProducts: Product[] = [
  // Livestock
  {
    id: '1',
    name: 'Fresian Dairy Cow',
    price: 45000,
    description: 'Healthy Fresian dairy cow, vaccinated, 3 years old. Good milk producer.',
    category: 'livestock',
    condition: 'used_good',
    location: 'Nyandarua',
    distance: '15km',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400',
    seller: { name: 'Green Valley Farm', verified: true, rating: 4.8, sales: 156, online: true },
    specifications: { Age: '3 years', Breed: 'Fresian', 'Vaccinated': 'Yes' },
    reviews: 24,
  },
  {
    id: '2',
    name: 'Dorper Sheep',
    price: 12000,
    description: 'Pure Dorper sheep, healthy and well maintained.',
    category: 'livestock',
    condition: 'used_good',
    location: 'Kajiado',
    distance: '25km',
    image: 'https://images.unsplash.com/photo-1588942262340-8c18e63b8e3a?w=400',
    seller: { name: 'Molo Fresh', verified: true, rating: 4.5, sales: 89, online: true },
    reviews: 12,
  },
  {
    id: '3',
    name: 'Boer Goats',
    price: 8000,
    description: 'Healthy Boer goats, perfect for breeding.',
    category: 'livestock',
    condition: 'used_good',
    location: 'Baringo',
    distance: '30km',
    image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=400',
    seller: { name: 'Uasin Gishu Farms', verified: true, rating: 4.6, sales: 67, online: false },
    reviews: 8,
  },
  // Crops
  {
    id: '4',
    name: 'Grade A Maize Seeds',
    price: 2500,
    originalPrice: 2800,
    description: 'High-quality maize seeds from certified farms. Drought-resistant variety with 90% germination rate.',
    category: 'seeds',
    condition: 'new',
    location: 'Nakuru',
    distance: '2km',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    seller: { name: 'Green Valley Farms', verified: true, rating: 4.8, sales: 156, online: true },
    stock: 50,
    specifications: { Variety: 'H614', 'Pack Size': '2kg', Coverage: '1 acre', 'Shelf Life': '12 months', Organic: 'Yes' },
    reviews: 24,
    featured: true,
  },
  {
    id: '5',
    name: 'Fresh Potatoes',
    price: 80,
    description: 'Fresh potatoes from Nakuru highlands. Best quality.',
    category: 'crops',
    condition: 'new',
    location: 'Nakuru',
    distance: '3km',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber80?w=400',
    seller: { name: 'Molo Fresh', verified: true, rating: 4.5, sales: 89, online: true },
    stock: 200,
    reviews: 18,
  },
  {
    id: '6',
    name: 'Fresh Tomatoes',
    price: 120,
    description: 'Organic tomatoes, freshly harvested.',
    category: 'crops',
    condition: 'new',
    location: 'Kakamega',
    distance: '8km',
    image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0e?w=400',
    seller: { name: 'Kakamega Organics', verified: true, rating: 4.7, sales: 45, online: true },
    stock: 100,
    reviews: 32,
  },
  // Machinery
  {
    id: '7',
    name: 'John Deere Tractor',
    price: 1200000,
    description: '2022 Model John Deere tractor. Good condition, 500 hours only.',
    category: 'machinery',
    condition: 'used_good',
    location: 'Nakuru',
    distance: '5km',
    image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=400',
    seller: { name: 'Agri Machinery Kenya', verified: true, rating: 4.9, sales: 23, online: false },
    specifications: { 'Model Year': '2022', Hours: '500', Brand: 'John Deere', Condition: 'Good' },
    reviews: 5,
  },
  {
    id: '8',
    name: 'Farm Tools Set',
    price: 4500,
    description: 'Complete farm tools set including hoe, panga, rake, and more.',
    category: 'tools',
    condition: 'new',
    location: 'Eldoret',
    distance: '12km',
    image: 'https://images.unsplash.com/photo-1611518503044-a5b9ebc29edf?w=400',
    seller: { name: 'Eldoret Hardware', verified: true, rating: 4.6, sales: 234, online: true },
    stock: 30,
    reviews: 45,
  },
  // Fertilizer
  {
    id: '9',
    name: 'NPK Fertilizer 50kg',
    price: 3200,
    description: 'Quality NPK fertilizer for all crops. Rich in nitrogen, phosphorus, and potassium.',
    category: 'fertilizer',
    condition: 'new',
    location: 'Nairobi',
    distance: '45km',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    seller: { name: 'Kenya Agro Supplies', verified: true, rating: 4.7, sales: 567, online: true },
    stock: 500,
    reviews: 89,
  },
];

const categories: { key: ProductCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'shopping-cart' },
  { key: 'livestock', label: 'Livestock', icon: 'pets' },
  { key: 'crops', label: 'Crops', icon: 'grass' },
  { key: 'machinery', label: 'Machinery', icon: 'agriculture' },
  { key: 'seeds', label: 'Seeds', icon: 'local-florist' },
  { key: 'tools', label: 'Tools', icon: 'build' },
  { key: 'fertilizer', label: 'Fertilizer', icon: 'science' },
];

const flashSaleEndsIn = { hours: 4, minutes: 32, seconds: 15 };

export default function MarketplaceScreen() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    location: 'Nakuru',
    distance: 10,
    minPrice: 0,
    maxPrice: 100000,
    condition: [],
    sellerType: [],
    rating: 0,
    sortBy: 'recommended',
  });

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 'c1', product: mockProducts[3], quantity: 2 },
    { id: 'c2', product: mockProducts[4], quantity: 5 },
  ]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [showSellerFlow, setShowSellerFlow] = useState(false);
  const [sellerStep, setSellerStep] = useState(1);
  const [sellerForm, setSellerForm] = useState({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    price: '',
    condition: '',
  });

  // Order Management
  const [showOrders, setShowOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [showLeaveReview, setShowLeaveReview] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  // Mock Orders
  const mockOrders = [
    {
      id: 'MK-2024-12345',
      seller: 'Green Valley Farms',
      items: [
        { name: 'Maize Seeds x2', price: 5000, image: mockProducts[3].image },
        { name: 'Fertilizer x1', price: 1500, image: mockProducts[8].image },
      ],
      total: 6500,
      status: 'to_ship',
      date: 'May 12, 2024',
    },
    {
      id: 'MK-2024-12346',
      seller: 'Molo Fresh',
      items: [
        { name: 'Tomatoes x5', price: 600, image: mockProducts[5].image },
        { name: 'Potatoes x10', price: 800, image: mockProducts[4].image },
      ],
      total: 1400,
      status: 'delivered',
      date: 'May 10, 2024',
    },
  ];

  // Mock Reviews
  const mockReviews: Review[] = [
    { id: 'r1', author: 'John M.', rating: 5, date: '2 weeks ago', comment: 'Great germination rate, will buy again!' },
    { id: 'r2', author: 'Mary W.', rating: 4, date: '1 month ago', comment: 'Good quality, fast delivery.' },
    { id: 'r3', author: 'Peter K.', rating: 5, date: '2 months ago', comment: 'Excellent seeds, high yield expected.' },
  ];

  // Mock Addresses
  const mockAddresses: Address[] = [
    { id: 'a1', name: 'John Mwangi', street: 'Nakuru Town, Kenyatta Ave', phone: '+254 712 345 678', isDefault: true },
    { id: 'a2', name: 'Farm address', street: 'Molo, Green Valley Farm', phone: '+254 712 345 678', isDefault: false },
  ];

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Render Header
  const renderHeader = () => (
    <View>
      {/* Location Bar */}
      <View style={styles.locationBar}>
        <MaterialIcons name="location-on" size={20} color={colors.primaryGreen} />
        <Text style={styles.locationText}>Nakuru, Kenya</Text>
        <TouchableOpacity>
          <Text style={styles.changeLink}>Change</Text>
        </TouchableOpacity>
        <MaterialIcons name="arrow-drop-down" size={20} color={colors.mediumGray} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={colors.primaryGreen} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tractors, seeds, livestock..."
            placeholderTextColor={colors.mediumGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <MaterialIcons name="mic" size={20} color={colors.mediumGray} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, selectedCategory === cat.key && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <MaterialIcons name={cat.icon as any} size={16} color={selectedCategory === cat.key ? colors.white : colors.mediumGray} />
            <Text style={[styles.categoryChipText, selectedCategory === cat.key && { color: colors.white }]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Flash Sale Banner */}
      <View style={styles.flashSaleBanner}>
        <View style={styles.flashSaleHeader}>
          <MaterialIcons name="bolt" size={24} color={colors.white} />
          <Text style={styles.flashSaleTitle}>FLASH SALE - 24h only</Text>
        </View>
        <Text style={styles.flashSaleSubtitle}>20% off all seeds & fertilizer</Text>
        <View style={styles.flashSaleTimer}>
          <MaterialIcons name="timer" size={16} color={colors.white} />
          <Text style={styles.flashSaleTimerText}>
            Ends in {String(flashSaleEndsIn.hours).padStart(2, '0')}:{String(flashSaleEndsIn.minutes).padStart(2, '0')}:{String(flashSaleEndsIn.seconds).padStart(2, '0')}
          </Text>
        </View>
        <TouchableOpacity style={styles.shopNowButton}>
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>

      {/* Livestock Section */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Livestock Near You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.filter(p => p.category === 'livestock').map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.livestockCard}
              onPress={() => {
                setSelectedProduct(product);
                setShowProductDetail(true);
              }}
            >
              <View style={styles.livestockImageContainer}>
                <Image source={{ uri: product.image }} style={styles.livestockImage} />
              </View>
              <Text style={styles.livestockName}>{product.name}</Text>
              <Text style={styles.livestockPrice}>KES {product.price.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Crops Section */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fresh Produce</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.filter(p => p.category === 'crops' || p.category === 'seeds').slice(0, 4).map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.cropCard}
              onPress={() => {
                setSelectedProduct(product);
                setShowProductDetail(true);
              }}
            >
              <View style={styles.cropImageContainer}>
                <Image source={{ uri: product.image }} style={styles.cropImage} />
              </View>
              <Text style={styles.cropName}>{product.name}</Text>
              <Text style={styles.cropPrice}>KES {product.price.toLocaleString()}{product.category === 'crops' ? '/kg' : ''}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommended Section */}
      <View style={styles.recommendedSection}>
        <View style={styles.recommendedHeader}>
          <MaterialIcons name="person" size={20} color={colors.primaryGreen} />
          <Text style={styles.recommendedTitle}>Based on your farm profile</Text>
        </View>
        <Text style={styles.recommendedSubtitle}>Dairy feed • Fertilizer • Seeds</Text>
      </View>

      {/* Verified Sellers */}
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verified Sellers</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { name: 'Green Farm', location: 'Nakuru' },
            { name: 'Molo Fresh', location: 'Molo' },
            { name: 'Uasin Gishu', location: 'Eldoret' },
          ].map((seller, idx) => (
            <View key={idx} style={styles.sellerCard}>
              <View style={styles.sellerBadge}>
                <MaterialIcons name="verified" size={24} color={colors.primaryGreen} />
              </View>
              <Text style={styles.sellerName}>{seller.name}</Text>
              <Text style={styles.sellerLocation}>{seller.location}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Section Title */}
      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>
          {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.key === selectedCategory)?.label}
        </Text>
        <View style={styles.filterSortRow}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
            <MaterialIcons name="filter-list" size={20} color={colors.primaryGreen} />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="sort" size={20} color={colors.primaryGreen} />
            <Text style={styles.filterButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render Product Card (Grid)
  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(item);
        setShowProductDetail(true);
      }}
    >
      <View style={styles.productCardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productCardImage} />
        <TouchableOpacity style={styles.wishlistButton}>
          <MaterialIcons name="favorite-border" size={20} color={colors.red} />
        </TouchableOpacity>
        {item.originalPrice && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>-{Math.round((1 - item.price / item.originalPrice) * 100)}%</Text>
          </View>
        )}
      </View>
      <View style={styles.productCardContent}>
        {item.seller.verified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={12} color={colors.primaryGreen} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
        <Text style={styles.productCardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCardPrice}>KES {item.price.toLocaleString()}</Text>
        <View style={styles.productCardMeta}>
          <MaterialIcons name="location-on" size={14} color={colors.mediumGray} />
          <Text style={styles.productCardLocation}>{item.location} • {item.distance}</Text>
        </View>
        <View style={styles.productCardRating}>
          <MaterialIcons name="star" size={14} color={colors.orange} />
          <Text style={styles.productCardRatingText}>{item.seller.rating} ({item.reviews})</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton}>
          <MaterialIcons name="shopping-cart" size={16} color={colors.white} />
          <Text style={styles.addToCartText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render Filter Modal
  const renderFilterModal = () => (
    <Modal visible={showFilter} animationType="slide" transparent>
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
            </TouchableOpacity>
            <Text style={styles.filterModalTitle}>Filter Products</Text>
            <TouchableOpacity>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalBody}>
            {/* Category */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>CATEGORY</Text>
              {categories.slice(1).map((cat) => (
                <TouchableOpacity key={cat.key} style={styles.filterOption}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons name={cat.icon as any} size={20} color={colors.primaryGreen} />
                    <Text style={styles.filterOptionText}>{cat.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Location */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>LOCATION</Text>
              <View style={styles.locationFilterRow}>
                <Text style={styles.locationFilterLabel}>Within</Text>
                <View style={styles.distanceInput}>
                  <Text style={styles.distanceInputText}>10 km</Text>
                </View>
                <Text style={styles.locationFilterLabel}>of Nakuru</Text>
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>PRICE RANGE</Text>
              <View style={styles.priceRangeInputs}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceInputLabel}>Min: KES</Text>
                  <TextInput style={styles.priceInputField} placeholder="0" keyboardType="numeric" />
                </View>
                <Text style={styles.priceRangeDash}>-</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.priceInputLabel}>Max: KES</Text>
                  <TextInput style={styles.priceInputField} placeholder="100,000+" keyboardType="numeric" />
                </View>
              </View>
              <View style={styles.quickPriceFilters}>
                {['Under 5k', '5k-20k', '20k-50k', '50k+'].map((price) => (
                  <TouchableOpacity key={price} style={styles.quickPriceChip}>
                    <Text style={styles.quickPriceText}>{price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Condition */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>CONDITION</Text>
              {['New', 'Like New', 'Used - Good', 'Used - Fair'].map((condition) => (
                <TouchableOpacity key={condition} style={styles.filterCheckbox}>
                  <View style={styles.checkbox} />
                  <Text style={styles.filterOptionText}>{condition}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Seller Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>SELLER TYPE</Text>
              {['Verified Sellers Only', 'Individual Farmers', 'Registered Businesses', 'Cooperatives'].map((type) => (
                <TouchableOpacity key={type} style={styles.filterCheckbox}>
                  <View style={styles.checkbox} />
                  <Text style={styles.filterOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>RATING</Text>
              {[4.5, 4.0, 3.5].map((rating) => (
                <TouchableOpacity key={rating} style={styles.ratingOption}>
                  <View style={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialIcons
                        key={i}
                        name="star"
                        size={16}
                        color={i < Math.floor(rating) ? colors.orange : colors.borderGray}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingOptionText}> & above</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>SORT BY</Text>
              {['Recommended', 'Nearest First', 'Price: Low to High', 'Price: High to Low', 'Newest First', 'Highest Rated'].map((sort) => (
                <TouchableOpacity key={sort} style={styles.sortOption}>
                  <View style={styles.radioCircle} />
                  <Text style={styles.filterOptionText}>{sort}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.showProductsButton} onPress={() => setShowFilter(false)}>
            <Text style={styles.showProductsText}>Show {filteredProducts.length} Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render Product Detail Modal
  const renderProductDetailModal = () => {
    if (!selectedProduct) return null;
    return (
      <Modal visible={showProductDetail} animationType="slide">
        <SafeAreaView style={styles.detailModalContainer}>
          <View style={styles.detailModalHeader}>
            <TouchableOpacity onPress={() => setShowProductDetail(false)}>
              <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
            </TouchableOpacity>
            <Text style={styles.detailModalTitle}>Product</Text>
            <View style={styles.detailModalActions}>
              <TouchableOpacity>
                <MaterialIcons name="favorite-border" size={24} color={colors.red} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 16 }}>
                <MaterialIcons name="share" size={24} color={colors.mediumGray} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.detailModalContent} showsVerticalScrollIndicator={false}>
            {/* Image Gallery */}
            <View style={styles.detailImageContainer}>
              <Image source={{ uri: selectedProduct.image }} style={styles.detailMainImage} />
              <View style={styles.imagePageDots}>
                <View style={[styles.pageDot, styles.pageDotActive]} />
                <View style={styles.pageDot} />
                <View style={styles.pageDot} />
              </View>
            </View>

            {/* Seller Info Bar */}
            <View style={styles.sellerInfoBar}>
              <View style={styles.sellerInfoLeft}>
                <View style={styles.sellerAvatar}>
                  <MaterialIcons name="person" size={24} color={colors.white} />
                </View>
                <View>
                  <Text style={styles.sellerInfoName}>{selectedProduct.seller.name}</Text>
                  <View style={styles.sellerInfoMeta}>
                    {selectedProduct.seller.verified && (
                      <View style={styles.verifiedBadgeSmall}>
                        <MaterialIcons name="verified" size={12} color={colors.primaryGreen} />
                        <Text style={styles.verifiedTextSmall}>Verified Seller</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.sellerInfoRight}>
                <View style={styles.sellerRating}>
                  <MaterialIcons name="star" size={16} color={colors.orange} />
                  <Text style={styles.sellerRatingText}>{selectedProduct.seller.rating}</Text>
                </View>
                <Text style={styles.sellerSales}>{selectedProduct.seller.sales} sales</Text>
              </View>
            </View>
            <View style={styles.sellerChatRow}>
              <Text style={styles.sellerOnlineStatus}>
                {selectedProduct.seller.online ? 'Online now' : 'Offline'}
              </Text>
              <TouchableOpacity style={styles.chatButtonSmall}>
                <MaterialIcons name="chat" size={16} color={colors.primaryGreen} />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>

            {/* Product Title */}
            <Text style={styles.detailProductTitle}>{selectedProduct.name}</Text>

            {/* Pricing */}
            <View style={styles.pricingSection}>
              <Text style={styles.detailPrice}>KES {selectedProduct.price.toLocaleString()}</Text>
              {selectedProduct.originalPrice && (
                <>
                  <Text style={styles.detailOriginalPrice}>KES {selectedProduct.originalPrice.toLocaleString()}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>Save KES {(selectedProduct.originalPrice - selectedProduct.price).toLocaleString()}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Key Details */}
            <View style={styles.keyDetailsRow}>
              <View style={styles.keyDetailChip}>
                <MaterialIcons name="location-on" size={16} color={colors.mediumGray} />
                <Text style={styles.keyDetailText}>{selectedProduct.location}</Text>
              </View>
              <View style={styles.keyDetailChip}>
                <MaterialIcons name="inventory-2" size={16} color={colors.primaryGreen} />
                <Text style={styles.keyDetailText}>In Stock</Text>
              </View>
              <View style={styles.keyDetailChip}>
                <MaterialIcons name="verified" size={16} color={colors.primaryGreen} />
                <Text style={styles.keyDetailText}>Certified</Text>
              </View>
              <View style={styles.keyDetailChip}>
                <MaterialIcons name="autorenew" size={16} color={colors.blue} />
                <Text style={styles.keyDetailText}>Returns</Text>
              </View>
            </View>

            {/* Quantity */}
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <MaterialIcons name="remove" size={20} color={colors.primaryGreen} />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <MaterialIcons name="add" size={20} color={colors.primaryGreen} />
                </TouchableOpacity>
                <Text style={styles.stockText}>• {selectedProduct.stock || 10} available</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>DESCRIPTION</Text>
              <Text style={styles.descriptionText}>{selectedProduct.description}</Text>
              <TouchableOpacity>
                <Text style={styles.readMoreText}>Read more</Text>
              </TouchableOpacity>
            </View>

            {/* Specifications */}
            {selectedProduct.specifications && (
              <View style={styles.specificationsSection}>
                <Text style={styles.sectionLabel}>SPECIFICATIONS</Text>
                <View style={styles.specificationsGrid}>
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <View key={key} style={styles.specRow}>
                      <Text style={styles.specKey}>{key}</Text>
                      <Text style={styles.specValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Seller Location */}
            <View style={styles.sellerLocationSection}>
              <Text style={styles.sectionLabel}>SELLER LOCATION</Text>
              <View style={styles.sellerLocationCard}>
                <MaterialIcons name="location-on" size={24} color={colors.primaryGreen} />
                <Text style={styles.sellerLocationText}>{selectedProduct.location}, Kenya</Text>
                <TouchableOpacity style={styles.viewMapButton}>
                  <Text style={styles.viewMapText}>View Map</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reviews */}
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionLabel}>REVIEWS</Text>
                <View style={styles.ratingSummary}>
                  <MaterialIcons name="star" size={20} color={colors.orange} />
                  <Text style={styles.ratingAverage}>{selectedProduct.seller.rating}</Text>
                  <Text style={styles.reviewsCount}>({selectedProduct.reviews} reviews)</Text>
                </View>
              </View>
              <View style={styles.reviewBars}>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = stars === 5 ? 15 : stars === 4 ? 6 : stars === 3 ? 2 : 1;
                  const percentage = (count / 24) * 100;
                  return (
                    <View key={stars} style={styles.reviewBarRow}>
                      <Text style={styles.reviewBarLabel}>{stars} ★</Text>
                      <View style={styles.reviewBarTrack}>
                        <View style={[styles.reviewBarFill, { width: `${percentage}%` }]} />
                      </View>
                      <Text style={styles.reviewBarCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Top Reviews */}
            <View style={[styles.reviewsSection, { marginTop: 16 }]}>
              <Text style={styles.sectionLabel}>TOP REVIEWS</Text>
              {mockReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <MaterialIcons name="person" size={18} color={colors.white} />
                    </View>
                    <View>
                      <Text style={styles.reviewAuthor}>{review.author}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialIcons
                        key={i}
                        name="star"
                        size={14}
                        color={i < review.rating ? colors.orange : colors.borderGray}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewComment}>"{review.comment}"</Text>
                </View>
              ))}
            </View>

            {/* Similar Products */}
            <View style={styles.similarSection}>
              <Text style={styles.sectionLabel}>SIMILAR PRODUCTS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarScrollView}>
                {products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 5).map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.similarCard}
                    onPress={() => setSelectedProduct(product)}
                  >
                    <Image source={{ uri: product.image }} style={styles.similarImage} />
                    <Text style={styles.similarName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.similarPrice}>KES {product.price.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Sticky Action Bar */}
          <View style={styles.stickyActionBar}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="favorite-border" size={20} color={colors.red} />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={colors.primaryGreen} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.addToCartActionButton]}>
              <MaterialIcons name="shopping-cart" size={20} color={colors.primaryGreen} />
              <Text style={[styles.actionButtonText, styles.addToCartActionText]}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.buyNowActionButton]}
              onPress={() => {
                setShowProductDetail(false);
                setShowCart(true);
              }}
            >
              <Text style={[styles.actionButtonText, styles.buyNowActionText]}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={styles.loadingText}>Loading marketplace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Marketplace</Text>
          <TouchableOpacity style={styles.cartButton}>
            <MaterialIcons name="shopping-cart" size={24} color={colors.primaryGreen} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primaryGreen]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="inventory-2" size={64} color={colors.borderGray} />
            <Text style={styles.emptyStateTitle}>No products found</Text>
            <Text style={styles.emptyStateSubtitle}>Try adjusting your filters</Text>
          </View>
        }
      />

      {/* Sell FAB */}
      <TouchableOpacity style={styles.sellFab} onPress={() => setShowSellerFlow(true)}>
        <MaterialIcons name="add" size={28} color={colors.white} />
        <Text style={styles.sellFabText}>SELL</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Product Detail Modal */}
      {renderProductDetailModal()}

      {/* Cart Modal */}
      {showCart && checkoutStep === 0 && (
        <Modal visible={showCart} animationType="slide" transparent>
          <View style={styles.filterModalOverlay}>
            <View style={styles.cartModalContent}>
              <View style={styles.cartModalHeader}>
                <TouchableOpacity onPress={() => setShowCart(false)}>
                  <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
                </TouchableOpacity>
                <Text style={styles.filterModalTitle}>My Cart ({cartItems.length})</Text>
                <TouchableOpacity>
                  <Text style={styles.resetText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.filterModalBody}>
                {cartItems.map((item) => (
                  <View key={item.id} style={styles.cartItemCard}>
                    <Image source={{ uri: item.product.image }} style={styles.cartItemImage} />
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.product.name}</Text>
                      <Text style={styles.cartItemPrice}>KES {item.product.price.toLocaleString()}</Text>
                      <View style={styles.cartItemQuantity}>
                        <TouchableOpacity style={styles.cartQuantityButton}>
                          <MaterialIcons name="remove" size={16} color={colors.mediumGray} />
                        </TouchableOpacity>
                        <Text style={styles.cartQuantityValue}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.cartQuantityButton}>
                          <MaterialIcons name="add" size={16} color={colors.mediumGray} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <MaterialIcons name="delete" size={20} color={colors.red} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                <Text style={styles.cartSectionTitle}>SAVE FOR LATER</Text>
                <View style={styles.cartItemCard}>
                  <Image source={{ uri: 'https://via.placeholder.com/70' }} style={styles.cartItemImage} />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>Tractor Spare Part</Text>
                    <Text style={styles.cartItemPrice}>KES 3,500</Text>
                    <TouchableOpacity>
                      <Text style={styles.resetText}>Move to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.cartSectionTitle}>COUPON</Text>
                <View style={styles.couponInput}>
                  <TextInput style={styles.couponInputField} placeholder="Offer code" />
                  <TouchableOpacity style={styles.couponButton}>
                    <Text style={styles.couponButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.orderSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>KES 6,400</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery</Text>
                    <Text style={styles.summaryValue}>KES 450</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Discount</Text>
                    <Text style={[styles.summaryValue, { color: colors.red }]}>-KES 300</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotal}>Total</Text>
                    <Text style={styles.summaryTotalValue}>KES 6,550</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.proceedButton}
                  onPress={() => setCheckoutStep(1)}
                >
                  <Text style={styles.proceedButtonText}>PROCEED TO CHECKOUT</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Checkout Step 1: Delivery Address */}
      {checkoutStep === 1 && (
        <Modal visible={true} animationType="slide">
          <SafeAreaView style={styles.detailModalContainer}>
            <View style={styles.checkoutHeader}>
              <TouchableOpacity onPress={() => setCheckoutStep(0)}>
                <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
              </TouchableOpacity>
              <Text style={styles.checkoutTitle}>Checkout (1/3)</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.checkoutContent}>
              <Text style={styles.cartSectionTitle}>SAVED ADDRESSES</Text>
              {mockAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addressCard, selectedAddress?.id === addr.id && styles.addressCardSelected]}
                  onPress={() => setSelectedAddress(addr)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons 
                      name={selectedAddress?.id === addr.id ? 'radio-button-checked' : 'radio-button-unchecked'} 
                      size={20} 
                      color={selectedAddress?.id === addr.id ? colors.primaryGreen : colors.borderGray} 
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.addressName}>{addr.name}</Text>
                      <Text style={styles.addressDetails}>{addr.street}</Text>
                      <Text style={styles.addressPhone}>{addr.phone}</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.addressEdit}>Edit</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.proceedButton}>
                <Text style={styles.proceedButtonText}>Continue to Delivery</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Checkout Step 2: Delivery Method */}
      {checkoutStep === 2 && (
        <Modal visible={true} animationType="slide">
          <SafeAreaView style={styles.detailModalContainer}>
            <View style={styles.checkoutHeader}>
              <TouchableOpacity onPress={() => setCheckoutStep(1)}>
                <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
              </TouchableOpacity>
              <Text style={styles.checkoutTitle}>Checkout (2/3)</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.checkoutContent}>
              {[
                { key: 'pickup', label: 'Pickup Station', price: 'FREE', time: 'Nakuru Town • 2-3 days' },
                { key: 'standard', label: 'Standard Delivery', price: 'KES 200', time: '1-2 business days' },
                { key: 'express', label: 'Express Delivery', price: 'KES 450', time: 'Today before 6pm' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.deliveryOption, deliveryMethod === option.key && styles.deliveryOptionSelected]}
                  onPress={() => setDeliveryMethod(option.key)}
                >
                  <MaterialIcons 
                    name={deliveryMethod === option.key ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={20} 
                    color={deliveryMethod === option.key ? colors.primaryGreen : colors.borderGray} 
                  />
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryName}>{option.label} - {option.price}</Text>
                    <Text style={styles.deliveryTime}>{option.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.proceedButton}
                onPress={() => setCheckoutStep(3)}
              >
                <Text style={styles.proceedButtonText}>Continue to Payment</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Checkout Step 3: Payment Method */}
      {checkoutStep === 3 && (
        <Modal visible={true} animationType="slide">
          <SafeAreaView style={styles.detailModalContainer}>
            <View style={styles.checkoutHeader}>
              <TouchableOpacity onPress={() => setCheckoutStep(2)}>
                <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
              </TouchableOpacity>
              <Text style={styles.checkoutTitle}>Checkout (3/3)</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.checkoutContent}>
              <Text style={styles.cartSectionTitle}>WALLET BALANCE</Text>
              <View style={styles.walletCard}>
                <Text style={styles.walletBalance}>Wallet Balance</Text>
                <Text style={styles.walletAmount}>KES 12,500</Text>
                <TouchableOpacity 
                  style={[styles.proceedButton, { marginTop: 12 }]}
                  onPress={() => setPaymentMethod('wallet')}
                >
                  <Text style={styles.proceedButtonText}>Use Wallet</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cartSectionTitle}>PAYMENT METHODS</Text>
              {[
                { key: 'mpesa', label: 'M-Pesa', desc: 'Pay with your phone' },
                { key: 'card', label: 'Card Payment', desc: 'Visa/Mastercard' },
                { key: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
              ].map((method) => (
                <TouchableOpacity
                  key={method.key}
                  style={[styles.paymentCard, paymentMethod === method.key && styles.paymentCardSelected]}
                  onPress={() => setPaymentMethod(method.key)}
                >
                  <MaterialIcons 
                    name={paymentMethod === method.key ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={20} 
                    color={paymentMethod === method.key ? colors.primaryGreen : colors.borderGray} 
                  />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{method.label}</Text>
                    <Text style={styles.paymentDesc}>{method.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <View style={styles.orderTotalSection}>
                <Text style={styles.orderTotalLabel}>ORDER TOTAL</Text>
                <Text style={styles.orderTotalValue}>KES 6,550</Text>
              </View>

              <TouchableOpacity 
                style={styles.confirmPaymentButton}
                onPress={() => setCheckoutStep(4)}
              >
                <Text style={styles.proceedButtonText}>CONFIRM PAYMENT</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Checkout Step 4: Order Confirmation */}
      {checkoutStep === 4 && (
        <Modal visible={true} animationType="slide">
          <SafeAreaView style={styles.detailModalContainer}>
            <ScrollView style={styles.checkoutContent}>
              <View style={styles.confirmationContent}>
                <MaterialIcons name="celebration" size={64} color={colors.primaryGreen} />
                <Text style={styles.confirmationTitle}>Order Placed Successfully!</Text>
                <Text style={styles.confirmationOrderId}>Order #: MK-2024-12345</Text>
                <Text style={styles.confirmationTotal}>Total: KES 6,550</Text>
                <Text style={styles.confirmationMessage}>We've sent confirmation to john@example.com</Text>

                <View style={styles.confirmationButtons}>
                  <TouchableOpacity style={styles.trackOrderButton}>
                    <Text style={styles.trackOrderText}>Track Order</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewReceiptButton}>
                    <MaterialIcons name="receipt" size={20} color={colors.primaryGreen} />
                    <Text style={styles.viewReceiptText}>View Receipt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.continueShoppingButton} onPress={() => {
                    setCheckoutStep(0);
                    setShowCart(false);
                  }}>
                  <MaterialIcons name="home" size={20} color={colors.white} />
                  <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
                </View>

                <View style={styles.shareSection}>
                  <Text style={styles.shareText}>Share your purchase:</Text>
                  <View style={styles.shareButtons}>
                    <TouchableOpacity style={styles.shareButton}>
                      <MaterialIcons name="facebook" size={20} color={colors.primaryGreen} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                      <MaterialIcons name="chat-bubble" size={20} color={colors.primaryGreen} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                      <MaterialIcons name="share" size={20} color={colors.primaryGreen} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Seller Flow Modal */}
      {showSellerFlow && (
        <Modal visible={showSellerFlow} animationType="slide">
          <SafeAreaView style={styles.sellerModalContent}>
            <View style={styles.sellerHeader}>
              <TouchableOpacity onPress={() => sellerStep === 1 ? setShowSellerFlow(false) : setSellerStep(sellerStep - 1)}>
                <MaterialIcons name={sellerStep === 1 ? 'close' : 'arrow-back'} size={24} color={colors.darkCharcoal} />
              </TouchableOpacity>
              <Text style={styles.sellerHeaderTitle}>Sell Item</Text>
              <TouchableOpacity onPress={() => setShowSellerFlow(false)}>
                <MaterialIcons name="close" size={24} color={colors.darkCharcoal} />
              </TouchableOpacity>
            </View>
            <View style={styles.sellerProgress}>
              <Text style={styles.stepTitle}>
                Step {sellerStep} of 5 • {sellerStep === 1 ? 'Category & Photos' : sellerStep === 2 ? 'Product Details' : sellerStep === 3 ? 'Pricing & Inventory' : sellerStep === 4 ? 'Shipping & Location' : 'Preview & Publish'}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${sellerStep * 20}%` }]} />
              </View>
            </View>
            <ScrollView style={styles.sellerContent}>
              {/* Step 1: Category & Photos */}
              {sellerStep === 1 && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Main Category</Text>
                    <View style={styles.formSelect}>
                      <Text>Select category</Text>
                      <MaterialIcons name="arrow-drop-down" size={24} color={colors.mediumGray} />
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Subcategory</Text>
                    <View style={styles.formSelect}>
                      <Text>Select subcategory</Text>
                      <MaterialIcons name="arrow-drop-down" size={24} color={colors.mediumGray} />
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>PRODUCT PHOTOS</Text>
                    <View style={styles.photoGrid}>
                      {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={styles.photoSlot}>
                          <MaterialIcons name="add-a-photo" size={32} color={colors.mediumGray} />
                          <Text style={styles.photoSlotText}>{i === 4 ? 'Video' : `Add Photo ${i}`}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={{ fontSize: 12, color: colors.mediumGray, marginTop: 8 }}>First photo is cover</Text>
                  </View>
                </>
              )}

              {/* Step 2: Product Details */}
              {sellerStep === 2 && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>TITLE</Text>
                    <TextInput style={styles.formInput} placeholder="e.g. Fresian Dairy Cow, 3 years old, vaccinated" placeholderTextColor={colors.mediumGray} />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>DESCRIPTION</Text>
                    <TextInput style={[styles.formInput, { minHeight: 100 }]} placeholder="Describe your product..." placeholderTextColor={colors.mediumGray} multiline numberOfLines={4} />
                    <Text style={{ fontSize: 12, color: colors.mediumGray, marginTop: 4 }}>0/500 characters</Text>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>CONDITION</Text>
                    <View style={styles.conditionRow}>
                      {['New', 'Like New', 'Used - Good', 'Used - Fair'].map((cond) => (
                        <TouchableOpacity key={cond} style={styles.conditionChip}>
                          <Text style={styles.conditionChipText}>{cond}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>BRAND (Optional)</Text>
                    <TextInput style={styles.formInput} placeholder="e.g. John Deere" placeholderTextColor={colors.mediumGray} />
                  </View>
                </>
              )}

              {/* Step 3: Pricing & Inventory */}
              {sellerStep === 3 && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>PRICE</Text>
                    <View style={styles.priceInputRow}>
                      <Text style={styles.currencySymbol}>KES</Text>
                      <TextInput style={styles.priceInput} placeholder="45,000" placeholderTextColor={colors.mediumGray} keyboardType="numeric" />
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>COMPARE AT PRICE (Optional)</Text>
                    <View style={styles.priceInputRow}>
                      <Text style={styles.currencySymbol}>KES</Text>
                      <TextInput style={styles.priceInput} placeholder="50,000" placeholderTextColor={colors.mediumGray} keyboardType="numeric" />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.mediumGray, marginTop: 4 }}>Shows original price with strikethrough</Text>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>QUANTITY AVAILABLE</Text>
                    <TextInput style={styles.formInput} placeholder="1" placeholderTextColor={colors.mediumGray} keyboardType="numeric" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>MINIMUM ORDER</Text>
                    <TextInput style={styles.formInput} placeholder="1" placeholderTextColor={colors.mediumGray} keyboardType="numeric" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>LOW STOCK ALERT</Text>
                    <View style={styles.lowStockRow}>
                      <Text style={{ fontSize: 14 }}>Alert me when stock below</Text>
                      <TextInput style={[styles.formInput, { width: 80 }]} placeholder="5" placeholderTextColor={colors.mediumGray} keyboardType="numeric" />
                    </View>
                  </View>
                </>
              )}

              {/* Step 4: Shipping & Location */}
              {sellerStep === 4 && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>PICKUP LOCATION</Text>
                    <View style={styles.locationCard}>
                      <MaterialIcons name="location-on" size={24} color={colors.primaryGreen} />
                      <Text style={{ flex: 1, marginLeft: 12 }}>Nakuru, Kenya</Text>
                      <TouchableOpacity>
                        <Text style={styles.resetText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>DELIVERY OPTIONS</Text>
                    {[
                      { label: 'Pickup Only', sublabel: 'Free', checked: true },
                      { label: 'Seller Arranged Delivery', sublabel: 'Cost: KES', checked: false },
                      { label: 'Delivery within Nakuru', sublabel: 'Cost: KES 500', checked: false },
                      { label: 'Nationwide Delivery', sublabel: 'Cost: KES 1,500', checked: false },
                    ].map((opt, idx) => (
                      <TouchableOpacity key={idx} style={styles.checkboxOption}>
                        <MaterialIcons name={opt.checked ? 'check-box' : 'check-box-outline-blank'} size={24} color={opt.checked ? colors.primaryGreen : colors.borderGray} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.optionLabel}>{opt.label}</Text>
                          <Text style={styles.optionSublabel}>{opt.sublabel}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>DELIVERY TIME</Text>
                    <View style={styles.deliveryTimeRow}>
                      {['Same day', '1-2 days', '3-5 days', '1 week+'].map((time) => (
                        <TouchableOpacity key={time} style={styles.deliveryTimeChip}>
                          <Text style={styles.deliveryTimeText}>{time}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* Step 5: Preview & Publish */}
              {sellerStep === 5 && (
                <>
                  <Text style={[styles.formLabel, { marginBottom: 12 }]}>PREVIEW YOUR LISTING</Text>
                  <View style={styles.previewCard}>
                    <View style={styles.previewImagePlaceholder}>
                      <MaterialIcons name="image" size={40} color={colors.mediumGray} />
                    </View>
                    <View style={styles.previewInfo}>
                      <Text style={styles.previewTitle}>Fresian Dairy Cow</Text>
                      <View style={styles.verifiedBadge}>
                        <MaterialIcons name="verified" size={12} color={colors.primaryGreen} />
                        <Text style={styles.verifiedText}>Verified Seller</Text>
                      </View>
                      <Text style={styles.previewPrice}>KES 45,000</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <MaterialIcons name="location-on" size={14} color={colors.mediumGray} />
                        <Text style={styles.previewMeta}>Nakuru</Text>
                        <Text style={styles.previewMeta}> | </Text>
                        <Text style={styles.previewMeta}>Pickup only</Text>
                      </View>
                      <Text style={styles.previewDesc}>Vaccinated | 3 years old</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>VISIBILITY</Text>
                    {[
                      { label: 'Public', sublabel: 'Visible to everyone', checked: true },
                      { label: 'Verified Buyers Only', sublabel: '', checked: false },
                      { label: 'Private', sublabel: 'Share link only', checked: false },
                    ].map((opt, idx) => (
                      <TouchableOpacity key={idx} style={styles.radioOption}>
                        <MaterialIcons name={opt.checked ? 'radio-button-checked' : 'radio-button-unchecked'} size={20} color={opt.checked ? colors.primaryGreen : colors.borderGray} />
                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.optionLabel}>{opt.label}</Text>
                          {opt.sublabel && <Text style={styles.optionSublabel}>{opt.sublabel}</Text>}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>PROMOTION (Optional)</Text>
                    {[
                      { label: 'Boost listing', sublabel: 'KES 200 / 7 days', checked: false },
                      { label: 'Feature in category', sublabel: 'KES 150', checked: false },
                      { label: 'Urgent badge', sublabel: 'KES 50', checked: false },
                    ].map((opt, idx) => (
                      <TouchableOpacity key={idx} style={styles.checkboxOption}>
                        <MaterialIcons name={opt.checked ? 'check-box' : 'check-box-outline-blank'} size={24} color={opt.checked ? colors.primaryGreen : colors.borderGray} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.optionLabel}>{opt.label}</Text>
                          <Text style={styles.optionSublabel}>{opt.sublabel}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.feeSummary}>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>Listing Fee:</Text>
                      <Text style={[styles.feeValue, { color: colors.primaryGreen }]}>FREE</Text>
                    </View>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>Promotion Total:</Text>
                      <Text style={styles.feeValue}>KES 0</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.publishButton}
                    onPress={() => {
                      setShowSellerFlow(false);
                      alert('Listing published successfully!');
                    }}
                  >
                    <Text style={styles.publishButtonText}>PUBLISH LISTING</Text>
                  </TouchableOpacity>
                </>
              )}

              {sellerStep < 5 && (
                <>
                  <TouchableOpacity 
                    style={styles.sellerContinueButton}
                    onPress={() => setSellerStep(Math.min(5, sellerStep + 1))}
                  >
                    <Text style={styles.sellerContinueText}>Continue</Text>
                  </TouchableOpacity>
                  {sellerStep > 1 && (
                    <TouchableOpacity style={styles.sellerBackButton} onPress={() => setSellerStep(sellerStep - 1)}>
                      <Text style={styles.sellerBackText}>Back</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Order Management Modal */}
      {showOrders && (
        <Modal visible={showOrders} animationType="slide">
          <SafeAreaView style={styles.detailModalContainer}>
            <View style={styles.checkoutHeader}>
              <TouchableOpacity onPress={() => setShowOrders(false)}>
                <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
              </TouchableOpacity>
              <Text style={styles.checkoutTitle}>My Orders</Text>
              <TouchableOpacity>
                <MaterialIcons name="search" size={24} color={colors.darkCharcoal} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
              {['All', 'To Pay', 'To Ship', 'To Receive', 'Completed'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.categoryChip, orderFilter === tab.toLowerCase().replace(' ', '_') && styles.categoryChipActive]}
                  onPress={() => setOrderFilter(tab.toLowerCase().replace(' ', '_'))}
                >
                  <Text style={[styles.categoryChipText, orderFilter === tab.toLowerCase().replace(' ', '_') && { color: colors.white }]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <ScrollView style={styles.checkoutContent}>
              {mockOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  <Text style={styles.orderSeller}>{order.seller}</Text>
                  <View style={styles.orderItems}>
                    {order.items.map((item, idx) => (
                      <View key={idx} style={styles.orderItemRow}>
                        <Image source={{ uri: item.image }} style={styles.orderItemImage} />
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        <Text style={styles.orderItemPrice}>KES {item.price.toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalLabel}>Total</Text>
                    <Text style={styles.orderTotalValue}>KES {order.total.toLocaleString()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={[styles.statusBadge, { backgroundColor: order.status === 'to_ship' ? colors.orange : colors.primaryGreen }]}>
                      <Text style={[styles.statusBadgeText, { color: colors.white }]}>
                        {order.status === 'to_ship' ? 'To Ship' : 'Delivered'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.orderActions}>
                    <TouchableOpacity style={styles.orderActionButton}>
                      <Text style={styles.orderActionText}>Track Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.orderActionButton}>
                      <Text style={styles.orderActionText}>Contact Seller</Text>
                    </TouchableOpacity>
                    {order.status === 'delivered' && (
                      <TouchableOpacity style={[styles.orderActionButton, styles.orderActionButtonPrimary]} onPress={() => setShowLeaveReview(true)}>
                        <Text style={[styles.orderActionText, styles.orderActionTextPrimary]}>Leave Review</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Leave Review Modal */}
      {showLeaveReview && (
        <Modal visible={showLeaveReview} animationType="slide">
          <SafeAreaView style={styles.detailModalContainer}>
            <View style={styles.checkoutHeader}>
              <TouchableOpacity onPress={() => setShowLeaveReview(false)}>
                <MaterialIcons name="arrow-back" size={24} color={colors.darkCharcoal} />
              </TouchableOpacity>
              <Text style={styles.checkoutTitle}>Rate Your Purchase</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.checkoutContent}>
              <View style={styles.reviewFormSection}>
                <Text style={styles.formLabel}>PRODUCT</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <Image source={{ uri: mockProducts[3].image }} style={styles.orderItemImage} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.orderItemName}>Grade A Maize Seeds</Text>
                    <Text style={styles.orderSeller}>Green Valley Farms</Text>
                  </View>
                </View>
              </View>
              <View style={styles.reviewFormSection}>
                <Text style={styles.formLabel}>OVERALL RATING</Text>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} style={styles.ratingStarButton}>
                      <MaterialIcons name="star" size={40} color={colors.orange} />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ textAlign: 'center', color: colors.mediumGray, marginTop: 8 }}>Tap to rate</Text>
              </View>
              <View style={styles.reviewFormSection}>
                <Text style={styles.formLabel}>RATING CATEGORIES</Text>
                {['Quality', 'Value', 'Delivery', 'Seller Communication'].map((cat) => (
                  <View key={cat} style={styles.ratingCategoryRow}>
                    <Text style={styles.ratingCategoryLabel}>{cat}</Text>
                    <View style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} style={styles.ratingStarButton}>
                          <MaterialIcons name="star" size={20} color={colors.orange} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.reviewFormSection}>
                <Text style={styles.formLabel}>WRITE YOUR REVIEW</Text>
                <TextInput style={styles.reviewTextInput} placeholder="Great quality seeds..." placeholderTextColor={colors.mediumGray} multiline />
                <Text style={styles.charCount}>0/500 characters</Text>
              </View>
              <View style={styles.reviewFormSection}>
                <Text style={styles.formLabel}>ADD PHOTOS</Text>
                <View style={styles.photoUploadGrid}>
                  {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.photoUploadSlot}>
                      <MaterialIcons name="add-a-photo" size={24} color={colors.mediumGray} />
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.submitReviewButton} onPress={() => { setShowLeaveReview(false); alert('Review submitted!'); }}>
                <Text style={styles.proceedButtonText}>SUBMIT REVIEW</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Wallet Modal */}
      {showWallet && (
        <Modal visible={showWallet} animationType="slide" transparent>
          <View style={styles.filterModalOverlay}>
            <View style={styles.cartModalContent}>
              <View style={styles.cartModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="account-balance-wallet" size={24} color={colors.primaryGreen} />
                  <Text style={styles.filterModalTitle}>Your Wallet</Text>
                </View>
                <TouchableOpacity onPress={() => setShowWallet(false)}>
                  <MaterialIcons name="close" size={24} color={colors.darkCharcoal} />
                </TouchableOpacity>
              </View>
              <View style={styles.walletMiniCard}>
                <Text style={styles.walletBalanceLabel}>Balance</Text>
                <Text style={styles.walletBalanceAmount}>KES 12,500</Text>
                <View style={styles.walletButtons}>
                  <TouchableOpacity style={styles.walletButton}>
                    <Text style={styles.walletButtonText}>Deposit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.walletButton}>
                    <Text style={styles.walletButtonText}>Withdraw</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.walletButton}>
                    <Text style={styles.walletButtonText}>History</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.cartSectionTitle, { marginHorizontal: 16 }]}>Recent Transactions:</Text>
              <View style={{ paddingHorizontal: 16 }}>
                <View style={styles.transactionItem}>
                  <Text style={styles.transactionLabel}>Payment to Green Valley</Text>
                  <Text style={[styles.transactionAmount, styles.transactionNegative]}>-KES 2,500</Text>
                </View>
                <View style={styles.transactionItem}>
                  <Text style={styles.transactionLabel}>Deposit via M-Pesa</Text>
                  <Text style={[styles.transactionAmount, styles.transactionPositive]}>+KES 5,000</Text>
                </View>
                <View style={styles.transactionItem}>
                  <Text style={styles.transactionLabel}>Payment to Molo Fresh</Text>
                  <Text style={[styles.transactionAmount, styles.transactionNegative]}>-KES 800</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.proceedButton} onPress={() => setShowWallet(false)}>
                <Text style={styles.proceedButtonText}>View Full Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primaryGreen,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  // Location Bar
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    color: colors.darkCharcoal,
    fontWeight: '500',
  },
  changeLink: {
    fontSize: 14,
    color: colors.primaryGreen,
    marginLeft: 'auto',
  },
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.darkCharcoal,
  },
  // Category Chips
  categoryScroll: {
    backgroundColor: colors.white,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGray,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.mediumGray,
    fontWeight: '500',
  },
  // Flash Sale Banner
  flashSaleBanner: {
    backgroundColor: colors.primaryGreen,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashSaleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  flashSaleSubtitle: {
    fontSize: 14,
    color: colors.white,
    marginTop: 4,
  },
  flashSaleTimer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  flashSaleTimerText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  shopNowButton: {
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  shopNowText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  // Category Sections
  categorySection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  // Livestock Cards
  livestockCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  livestockImageContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  livestockImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  livestockName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  livestockPrice: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  // Crop Cards
  cropCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cropImageContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  cropImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  cropName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  cropPrice: {
    fontSize: 12,
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  // Recommended Section
  recommendedSection: {
    backgroundColor: colors.lightGreen,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  recommendedSubtitle: {
    fontSize: 14,
    color: colors.darkGreen,
    marginTop: 4,
  },
  // Seller Cards
  sellerCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sellerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    textAlign: 'center',
  },
  sellerLocation: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  // Products Header
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  filterSortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  // Product Grid
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: (screenWidth - 40) / 2,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productCardImageContainer: {
    position: 'relative',
  },
  productCardImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.orange,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saleBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  productCardContent: {
    padding: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  productCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 4,
  },
  productCardPrice: {
    fontSize: 16,
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  productCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  productCardLocation: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  productCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  productCardRatingText: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGreen,
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 8,
    gap: 4,
  },
  addToCartText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 8,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.mediumGray,
  },
  // Sell FAB
  sellFab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: colors.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 6,
  },
  sellFabText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  // Filter Modal
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  resetText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  filterModalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 12,
  },
  filterOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  filterOptionText: {
    fontSize: 16,
    color: colors.darkCharcoal,
  },
  locationFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationFilterLabel: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  distanceInput: {
    backgroundColor: colors.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  distanceInputText: {
    fontSize: 14,
    color: colors.darkCharcoal,
    fontWeight: '500',
  },
  priceRangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  priceInput: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  priceInputField: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.darkCharcoal,
  },
  priceRangeDash: {
    fontSize: 16,
    color: colors.mediumGray,
    marginTop: 20,
  },
  quickPriceFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPriceChip: {
    backgroundColor: colors.lightGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  quickPriceText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  filterCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderGray,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingOptionText: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderGray,
  },
  showProductsButton: {
    backgroundColor: colors.primaryGreen,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  showProductsText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Product Detail Modal
  detailModalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  detailModalActions: {
    flexDirection: 'row',
  },
  detailModalContent: {
    flex: 1,
  },
  detailImageContainer: {
    position: 'relative',
  },
  detailMainImage: {
    width: '100%',
    height: 300,
  },
  imagePageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderGray,
  },
  pageDotActive: {
    backgroundColor: colors.primaryGreen,
    width: 24,
  },
  sellerInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.lightGray,
  },
  sellerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  sellerInfoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedTextSmall: {
    fontSize: 12,
    color: colors.primaryGreen,
  },
  sellerInfoRight: {
    alignItems: 'flex-end',
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  sellerSales: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  sellerChatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  sellerOnlineStatus: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  chatButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatButtonText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  detailProductTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.darkCharcoal,
    padding: 16,
    paddingBottom: 8,
  },
  pricingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  detailPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  detailOriginalPrice: {
    fontSize: 16,
    color: colors.mediumGray,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  keyDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  keyDetailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  keyDetailText: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  quantitySection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
    minWidth: 30,
    textAlign: 'center',
  },
  stockText: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  descriptionSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.mediumGray,
    lineHeight: 22,
  },
  readMoreText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
    marginTop: 8,
  },
  specificationsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  specificationsGrid: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  specKey: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  sellerLocationSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sellerLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sellerLocationText: {
    fontSize: 14,
    color: colors.darkCharcoal,
    flex: 1,
  },
  viewMapButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
  },
  viewMapText: {
    fontSize: 12,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  reviewsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingAverage: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  reviewsCount: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  reviewBars: {
    gap: 8,
  },
  reviewBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewBarLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    width: 30,
  },
  reviewBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderGray,
    borderRadius: 4,
  },
  reviewBarFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: 4,
  },
  reviewBarCount: {
    fontSize: 12,
    color: colors.mediumGray,
    width: 20,
  },
  stickyBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    backgroundColor: colors.white,
  },
  totalPriceSection: {
    flex: 1,
  },
  totalPriceLabel: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  buyNowButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buyNowText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Cart Styles
  cartModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
  },
  cartModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  cartItemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  cartItemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  cartItemPrice: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '700',
    marginTop: 4,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  cartQuantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartQuantityValue: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 12,
  },
  couponInput: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
  },
  couponInputField: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  couponButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  couponButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  orderSummary: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.darkCharcoal,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    marginVertical: 8,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkCharcoal,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  proceedButton: {
    backgroundColor: colors.primaryGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  proceedButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Checkout Styles
  checkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  checkoutTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
    textAlign: 'center',
  },
  checkoutContent: {
    flex: 1,
    padding: 16,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.borderGray,
  },
  addressCardSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.lightGreen,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  addressDetails: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  addressEdit: {
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  deliveryOption: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderGray,
  },
  deliveryOptionSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.lightGreen,
  },
  deliveryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  deliveryTime: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  deliveryPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  walletCard: {
    backgroundColor: colors.lightGreen,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  walletBalance: {
    fontSize: 14,
    color: colors.darkGreen,
  },
  walletAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderGray,
  },
  paymentCardSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.lightGreen,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  paymentDesc: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  orderTotalSection: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  confirmPaymentButton: {
    backgroundColor: colors.primaryGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  // Confirmation
  confirmationContent: {
    alignItems: 'center',
    padding: 32,
  },
  confirmationIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.darkCharcoal,
    marginBottom: 8,
  },
  confirmationOrderId: {
    fontSize: 16,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  confirmationTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryGreen,
    marginBottom: 16,
  },
  confirmationMessage: {
    fontSize: 14,
    color: colors.mediumGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationButtons: {
    gap: 12,
    width: '100%',
  },
  trackOrderButton: {
    backgroundColor: colors.primaryGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  trackOrderText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  viewReceiptButton: {
    backgroundColor: colors.lightGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewReceiptText: {
    color: colors.primaryGreen,
    fontSize: 16,
    fontWeight: '600',
  },
  continueShoppingButton: {
    backgroundColor: colors.darkCharcoal,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueShoppingText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  shareSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Seller Flow Styles
  sellerModalContent: {
    backgroundColor: colors.white,
    flex: 1,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  sellerHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  sellerProgress: {
    padding: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.borderGray,
    borderRadius: 3,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryGreen,
    borderRadius: 3,
  },
  stepTitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  sellerContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.darkCharcoal,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  formSelect: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.darkCharcoal,
    borderWidth: 1,
    borderColor: colors.borderGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoSlot: {
    width: (screenWidth - 80) / 2,
    height: 120,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderGray,
    borderStyle: 'dashed',
  },
  photoSlotText: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 8,
  },
  sellerContinueButton: {
    backgroundColor: colors.primaryGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  sellerContinueText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sellerBackButton: {
    padding: 16,
    alignItems: 'center',
  },
  sellerBackText: {
    color: colors.mediumGray,
    fontSize: 16,
  },
  // Similar Products
  similarSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  similarScrollView: {
    marginTop: 12,
  },
  similarCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  similarImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
  },
  similarName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  similarPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  // Top Reviews
  reviewCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.mediumGray,
    lineHeight: 20,
  },
  // Sticky Action Bar
  stickyActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.darkCharcoal,
    marginLeft: 4,
  },
  addToCartActionButton: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.primaryGreen,
  },
  addToCartActionText: {
    color: colors.primaryGreen,
  },
  buyNowActionButton: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
    flex: 1.5,
  },
  buyNowActionText: {
    color: colors.white,
  },
  // Seller Flow Styles - Step 2-5
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.white,
  },
  conditionChipText: {
    fontSize: 14,
    color: colors.darkCharcoal,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
    paddingHorizontal: 16,
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkCharcoal,
  },
  optionSublabel: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deliveryTimeChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  deliveryTimeText: {
    fontSize: 14,
    color: colors.darkCharcoal,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    flexDirection: 'row',
  },
  previewImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginTop: 4,
  },
  previewMeta: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 4,
  },
  previewDesc: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primaryGreen,
    fontWeight: '500',
  },
  feeSummary: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  publishButton: {
    backgroundColor: colors.primaryGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  publishButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Order Management
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  orderDate: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  orderSeller: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  orderItemName: {
    fontSize: 14,
    color: colors.darkCharcoal,
    marginLeft: 12,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkCharcoal,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
    paddingTop: 12,
    marginBottom: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  orderActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  orderActionButtonPrimary: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  orderActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkCharcoal,
  },
  orderActionTextPrimary: {
    color: colors.white,
  },
  // Review Styles
  reviewFormSection: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 16,
  },
  ratingStarButton: {
    padding: 4,
  },
  ratingCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  ratingCategoryLabel: {
    fontSize: 14,
    color: colors.darkCharcoal,
  },
  reviewTextInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: colors.darkCharcoal,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.mediumGray,
    textAlign: 'right',
    marginTop: 4,
  },
  photoUploadGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoUploadSlot: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderGray,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitReviewButton: {
    backgroundColor: colors.primaryGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  // Wallet Styles
  walletMiniCard: {
    backgroundColor: colors.lightGreen,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  walletBalanceLabel: {
    fontSize: 14,
    color: colors.darkGreen,
  },
  walletBalanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginVertical: 8,
  },
  walletButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  walletButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  walletButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  transactionLabel: {
    fontSize: 14,
    color: colors.darkCharcoal,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionPositive: {
    color: colors.primaryGreen,
  },
  transactionNegative: {
    color: colors.red,
  },
});
