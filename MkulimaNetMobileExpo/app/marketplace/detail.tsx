import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  seller: {
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    responseTime: string;
    isOnline: boolean;
  };
  description: string;
  specifications: Record<string, string>;
  location: string;
  condition: string;
  quantity: number;
  reviews: {
    id: number;
    user: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
    helpful: number;
  }[];
}

export default function ProductDetailScreen() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
  };

  const product: Product = {
    id: 1,
    title: 'High-Yield Maize Seeds - 5kg Pack (Hybrid Variety)',
    price: 4500,
    originalPrice: 5500,
    images: [
      'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600',
      'https://images.unsplash.com/photo-1567029547965-9c0b01b6b33a?w=600'
    ],
    seller: {
      name: 'GreenLeaf Farms',
      avatar: 'https://via.placeholder.com/40x40',
      rating: 4.8,
      reviewCount: 127,
      isVerified: true,
      responseTime: 'Usually responds in 30min',
      isOnline: true
    },
    description: 'Premium hybrid maize seeds with high yield potential. These seeds are specially bred for Kenyan climate conditions and offer excellent resistance to common diseases. Each pack contains 5kg of certified seeds suitable for both small-scale and commercial farming.',
    specifications: {
      'Brand': 'GreenLeaf Hybrid',
      'Variety': 'GL-2024',
      'Germination Rate': '95%+',
      'Maturity Period': '90-100 days',
      'Yield Potential': '8-12 tons/hectare',
      'Disease Resistance': 'Maize streak virus, Leaf blight',
      'Storage Life': '12 months',
      'Certification': 'KEBS Certified'
    },
    location: 'Nakuru, Kenya',
    condition: 'New',
    quantity: 50,
    reviews: [
      {
        id: 1,
        user: 'John Mwangi',
        avatar: 'https://via.placeholder.com/32x32',
        rating: 5,
        comment: 'Excellent quality seeds! My yield increased by 40% compared to last season. Very satisfied with the purchase.',
        date: '2 days ago',
        helpful: 12
      },
      {
        id: 2,
        user: 'Mary Wanjiru',
        avatar: 'https://via.placeholder.com/32x32',
        rating: 4,
        comment: 'Good germination rate and the plants are healthy. Delivery was fast and packaging was secure.',
        date: '1 week ago',
        helpful: 8
      },
      {
        id: 3,
        user: 'Samuel Ochieng',
        avatar: 'https://via.placeholder.com/32x32',
        rating: 5,
        comment: 'Best seeds I\'ve bought this season. The seller was very responsive and provided planting guidance.',
        date: '2 weeks ago',
        helpful: 15
      }
    ]
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.white }]}>
      <TouchableOpacity style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={colors.metadataText} />
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color={colors.metadataText} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => setIsWishlisted(!isWishlisted)}
        >
          <MaterialIcons 
            name={isWishlisted ? "favorite" : "favorite-border"} 
            size={24} 
            color={isWishlisted ? colors.primaryGreen : colors.metadataText} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageGallery = () => (
    <View style={styles.imageGallery}>
      <View style={styles.mainImageContainer}>
        <Image 
          source={{ uri: product.images[selectedImage] }} 
          style={styles.mainImage}
        />
        <TouchableOpacity style={styles.zoomButton}>
          <MaterialIcons name="zoom-in" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailsContainer}
        contentContainerStyle={styles.thumbnailsContent}
      >
        {product.images.map((image, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.thumbnail,
              selectedImage === index && styles.selectedThumbnail,
              { borderColor: selectedImage === index ? colors.primaryGreen : colors.borderColor }
            ]}
            onPress={() => setSelectedImage(index)}
          >
            <Image source={{ uri: image }} style={styles.thumbnailImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSellerInfo = () => (
    <View style={[styles.sellerCard, { backgroundColor: colors.white }]}>
      <View style={styles.sellerHeader}>
        <View style={styles.sellerInfo}>
          <Image 
            source={{ uri: product.seller.avatar }} 
            style={styles.sellerAvatar}
          />
          <View style={styles.sellerDetails}>
            <View style={styles.sellerNameRow}>
              <Text style={[styles.sellerName, { color: colors.primaryText }]}>{product.seller.name}</Text>
              {product.seller.isVerified && (
                <MaterialIcons name="verified" size={16} color={colors.primaryGreen} />
              )}
            </View>
            <View style={styles.sellerRating}>
              <MaterialIcons name="star" size={14} color={colors.secondaryGreen} />
              <Text style={[styles.ratingText, { color: colors.metadataText }]}>
                {product.seller.rating} ({product.seller.reviewCount} reviews)
              </Text>
            </View>
            <Text style={[styles.responseTime, { color: colors.metadataText }]}>
              {product.seller.responseTime}
            </Text>
          </View>
        </View>
        
        <View style={styles.sellerActions}>
          <TouchableOpacity style={[styles.messageButton, { borderColor: colors.primaryGreen }]}>
            <Text style={[styles.messageText, { color: colors.primaryGreen }]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewShopButton}>
            <Text style={[styles.viewShopText, { color: colors.primaryGreen }]}>View Shop</Text>
            <MaterialIcons name="arrow-forward" size={16} color={colors.primaryGreen} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPriceSection = () => {
    const discount = product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    return (
      <View style={[styles.priceSection, { backgroundColor: colors.white }]}>
        <Text style={[styles.productTitle, { color: colors.primaryText }]}>{product.title}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.currentPrice, { color: colors.primaryGreen }]}>
            KES {product.price.toLocaleString()}
          </Text>
          {product.originalPrice && (
            <Text style={[styles.originalPrice, { color: colors.metadataText }]}>
              KES {product.originalPrice.toLocaleString()}
            </Text>
          )}
        </View>
        
        {discount > 0 && (
          <View style={[styles.savingsBadge, { backgroundColor: colors.lightGreen }]}>
            <Text style={[styles.savingsText, { color: colors.primaryGreen }]}>
              Save KES {(product.originalPrice! - product.price).toLocaleString()} ({discount}% off)
            </Text>
          </View>
        )}
        
        <Text style={[styles.taxInfo, { color: colors.metadataText }]}>
          Inclusive of all taxes
        </Text>
      </View>
    );
  };

  const renderKeyDetails = () => (
    <View style={[styles.detailsSection, { backgroundColor: colors.white }]}>
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <MaterialIcons name="location-on" size={20} color={colors.secondaryGreen} />
          <Text style={[styles.detailLabel, { color: colors.metadataText }]}>Location</Text>
          <Text style={[styles.detailValue, { color: colors.primaryText }]}>{product.location}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons name="info" size={20} color={colors.secondaryGreen} />
          <Text style={[styles.detailLabel, { color: colors.metadataText }]}>Condition</Text>
          <Text style={[styles.detailValue, { color: colors.primaryText }]}>{product.condition}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons name="inventory" size={20} color={colors.secondaryGreen} />
          <Text style={[styles.detailLabel, { color: colors.metadataText }]}>Available</Text>
          <Text style={[styles.detailValue, { color: colors.primaryText }]}>{product.quantity} items</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MaterialIcons name="local-shipping" size={20} color={colors.secondaryGreen} />
          <Text style={[styles.detailLabel, { color: colors.metadataText }]}>Delivery</Text>
          <Text style={[styles.detailValue, { color: colors.primaryGreen }]}>Available</Text>
        </View>
      </View>
    </View>
  );

  const renderDescription = () => (
    <View style={[styles.descriptionSection, { backgroundColor: colors.white }]}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Description</Text>
      <Text style={[styles.descriptionText, { color: colors.secondaryText }]}>
        {product.description}
      </Text>
    </View>
  );

  const renderSpecifications = () => (
    <View style={[styles.specificationsSection, { backgroundColor: colors.white }]}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Specifications</Text>
      <View style={styles.specTable}>
        {Object.entries(product.specifications).map(([key, value], index) => (
          <View 
            key={key} 
            style={[
              styles.specRow,
              index % 2 === 0 && styles.evenRow,
              { backgroundColor: index % 2 === 0 ? colors.offWhite : colors.white }
            ]}
          >
            <Text style={[styles.specKey, { color: colors.primaryText }]}>{key}</Text>
            <Text style={[styles.specValue, { color: colors.secondaryText }]}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderReviews = () => {
    const averageRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;
    const ratingCounts = [0, 0, 0, 0, 0];
    product.reviews.forEach(review => {
      ratingCounts[review.rating - 1]++;
    });

    return (
      <View style={[styles.reviewsSection, { backgroundColor: colors.white }]}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Reviews</Text>
        
        <View style={styles.reviewsSummary}>
          <View style={styles.ratingSummary}>
            <Text style={[styles.averageRating, { color: colors.primaryText }]}>
              {averageRating.toFixed(1)}
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  name={star <= Math.floor(averageRating) ? "star" : "star-border"}
                  size={20}
                  color={colors.secondaryGreen}
                />
              ))}
            </View>
            <Text style={[styles.reviewCount, { color: colors.metadataText }]}>
              ({product.reviews.length} reviews)
            </Text>
          </View>
          
          <View style={styles.ratingBreakdown}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.ratingRow}>
                <Text style={[styles.ratingNumber, { color: colors.metadataText }]}>{rating}</Text>
                <MaterialIcons name="star" size={14} color={colors.secondaryGreen} />
                <View style={[styles.ratingBar, { backgroundColor: colors.borderColor }]}>
                  <View 
                    style={[
                      styles.ratingFill,
                      { 
                        backgroundColor: colors.secondaryGreen,
                        width: `${(ratingCounts[rating - 1] / product.reviews.length) * 100}%`
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.ratingCount, { color: colors.metadataText }]}>
                  {ratingCounts[rating - 1]}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.reviewsList}>
          {product.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image 
                  source={{ uri: review.avatar }} 
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewUserInfo}>
                  <Text style={[styles.reviewUser, { color: colors.primaryText }]}>{review.user}</Text>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <MaterialIcons
                        key={star}
                        name={star <= review.rating ? "star" : "star-border"}
                        size={14}
                        color={colors.secondaryGreen}
                      />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.metadataText }]}>{review.date}</Text>
              </View>
              <Text style={[styles.reviewComment, { color: colors.secondaryText }]}>{review.comment}</Text>
              <View style={styles.reviewActions}>
                <TouchableOpacity style={styles.helpfulButton}>
                  <MaterialIcons name="thumb-up-off-alt" size={14} color={colors.metadataText} />
                  <Text style={[styles.helpfulText, { color: colors.metadataText }]}>
                    {review.helpful} helpful
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderQuantitySelector = () => (
    <View style={styles.quantityContainer}>
      <Text style={[styles.quantityLabel, { color: colors.primaryText }]}>Quantity</Text>
      <View style={[styles.quantitySelector, { backgroundColor: colors.lightGray }]}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <MaterialIcons name="remove" size={20} color={colors.metadataText} />
        </TouchableOpacity>
        <Text style={[styles.quantityText, { color: colors.primaryText }]}>{quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.min(product.quantity, quantity + 1))}
        >
          <MaterialIcons name="add" size={20} color={colors.metadataText} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.stockInfo, { color: colors.metadataText }]}>
        {product.quantity} available
      </Text>
    </View>
  );

  const renderBuyBar = () => (
    <View style={[styles.buyBar, { backgroundColor: colors.white }]}>
      {renderQuantitySelector()}
      <View style={styles.buyButtons}>
        <TouchableOpacity 
          style={[styles.cartButton, { borderColor: colors.primaryGreen }]}
        >
          <MaterialIcons name="shopping-cart" size={20} color={colors.primaryGreen} />
          <Text style={[styles.cartText, { color: colors.primaryGreen }]}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.buyButton, { backgroundColor: colors.primaryGreen }]}
        >
          <Text style={styles.buyText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderImageGallery()}
        {renderSellerInfo()}
        {renderPriceSection()}
        {renderKeyDetails()}
        {renderDescription()}
        {renderSpecifications()}
        {renderReviews()}
      </ScrollView>
      
      {renderBuyBar()}
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
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    padding: 8,
    marginRight: 16,
  },
  wishlistButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    marginBottom: 16,
  },
  mainImageContainer: {
    height: 300,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  zoomButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailsContainer: {
    padding: 16,
  },
  thumbnailsContent: {
    paddingRight: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  sellerCard: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  responseTime: {
    fontSize: 14,
  },
  sellerActions: {
    alignItems: 'flex-end',
  },
  messageButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewShopButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewShopText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  priceSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  taxInfo: {
    fontSize: 14,
  },
  detailsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  specificationsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
  },
  specTable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  evenRow: {
    backgroundColor: '#FAFAFA',
  },
  specKey: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  reviewsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
  },
  reviewsSummary: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  ratingSummary: {
    alignItems: 'center',
    marginRight: 24,
  },
  averageRating: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 14,
  },
  ratingBreakdown: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 12,
    width: 20,
  },
  ratingBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingCount: {
    fontSize: 12,
    width: 20,
    textAlign: 'right',
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewActions: {
    alignItems: 'flex-start',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulText: {
    fontSize: 12,
    marginLeft: 4,
  },
  buyBar: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quantityContainer: {
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  stockInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  buyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
  },
  cartText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  buyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});