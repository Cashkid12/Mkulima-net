import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const { authState } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load product');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', error.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <FontAwesome name="circle-o-notch" size={48} color="#1B5E20" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-circle" size={48} color="#FF5252" />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Text style={styles.errorMessage}>The requested product could not be found.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.productImageContainer}>
        <Image 
          source={{ uri: product.image || 'https://via.placeholder.com/400x300' }} 
          style={styles.productImage} 
        />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>KSh {product.price?.toLocaleString()}</Text>
        
        <View style={styles.productDetails}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{product.category}</Text>
          
          <Text style={styles.detailLabel}>Quantity Available</Text>
          <Text style={styles.detailValue}>{product.quantity}</Text>
          
          <Text style={styles.detailLabel}>Condition</Text>
          <Text style={styles.detailValue}>{product.condition}</Text>
          
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{product.location}</Text>
          
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.detailValue}>{product.description}</Text>
        </View>
      </View>

      <View style={styles.sellerInfo}>
        <Text style={styles.sellerTitle}>Seller Information</Text>
        <View style={styles.sellerDetails}>
          <Image 
            source={{ uri: product.user.profilePicture || 'https://via.placeholder.com/60x60' }} 
            style={styles.sellerAvatar} 
          />
          <View>
            <Text style={styles.sellerName}>
              {product.user.firstName || product.user.username}
            </Text>
            <Text style={styles.sellerUsername}>@{product.user.username}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.contactButton}>
          <FontAwesome name="envelope" size={20} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>Contact Seller</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.inquireButton}>
          <FontAwesome name="shopping-cart" size={20} color="#1B5E20" />
          <Text style={styles.inquireButtonText}>Inquire Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  headerPlaceholder: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  productImageContainer: {
    height: 300,
    backgroundColor: '#F5F5F5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 16,
  },
  productDetails: {
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  detailValue: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
  sellerInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  sellerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  sellerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  sellerUsername: {
    fontSize: 14,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E20',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inquireButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1B5E20',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  inquireButtonText: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '600',
  },
});