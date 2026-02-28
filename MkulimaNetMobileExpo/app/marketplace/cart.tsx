import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface CartItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
  isVerified: boolean;
  sellerId: number;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      productId: 101,
      title: 'High-Yield Maize Seeds - 5kg Pack',
      price: 4500,
      quantity: 2,
      image: 'https://via.placeholder.com/80x80',
      seller: 'GreenLeaf Farms',
      isVerified: true,
      sellerId: 1
    },
    {
      id: 2,
      productId: 102,
      title: 'Organic Chicken Feed - 50kg Bag',
      price: 2800,
      quantity: 1,
      image: 'https://via.placeholder.com/80x80',
      seller: 'AgroVet Supplies',
      isVerified: true,
      sellerId: 2
    },
    {
      id: 3,
      productId: 103,
      title: 'Fertilizer - NPK 20:20:20 - 25kg',
      price: 1200,
      quantity: 3,
      image: 'https://via.placeholder.com/80x80',
      seller: 'Farm Inputs Ltd',
      isVerified: false,
      sellerId: 3
    }
  ]);

  const [editing, setEditing] = useState(false);

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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 10000 ? 0 : 450;
  const total = subtotal + deliveryFee;

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.white }]}>
      <TouchableOpacity style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={colors.metadataText} />
      </TouchableOpacity>
      
      <View style={styles.headerTitleContainer}>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>
          My Cart ({cartItems.length} items)
        </Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={[styles.editText, { color: colors.primaryGreen }]}>
            {editing ? 'Done' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { backgroundColor: colors.white }]}>
      <View style={styles.sellerHeader}>
        <View style={styles.sellerInfo}>
          <Text style={[styles.sellerName, { color: colors.primaryText }]}>{item.seller}</Text>
          {item.isVerified && (
            <MaterialIcons name="verified" size={14} color={colors.primaryGreen} />
          )}
        </View>
        <MaterialIcons name="expand-more" size={24} color={colors.metadataText} />
      </View>
      
      <View style={styles.itemContent}>
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.lightGray }]}>
          <MaterialIcons name="image" size={32} color={colors.metadataText} />
        </View>
        
        <View style={styles.itemDetails}>
          <Text style={[styles.itemTitle, { color: colors.primaryText }]} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={[styles.itemPrice, { color: colors.primaryGreen }]}>
            KES {item.price.toLocaleString()}
          </Text>
          
          <View style={styles.quantityContainer}>
            {!editing ? (
              <Text style={[styles.quantityText, { color: colors.metadataText }]}>
                Qty: {item.quantity}
              </Text>
            ) : (
              <View style={[styles.quantitySelector, { backgroundColor: colors.lightGray }]}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <MaterialIcons name="remove" size={16} color={colors.metadataText} />
                </TouchableOpacity>
                <Text style={[styles.quantityValue, { color: colors.primaryText }]}>
                  {item.quantity}
                </Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <MaterialIcons name="add" size={16} color={colors.metadataText} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <Text style={[styles.itemTotal, { color: colors.primaryText }]}>
            KES {(item.price * item.quantity).toLocaleString()}
          </Text>
          
          {editing && (
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <MaterialIcons name="delete" size={20} color={colors.error} />
              <Text style={[styles.removeText, { color: colors.error }]}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={[styles.summaryContainer, { backgroundColor: colors.white }]}>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: colors.primaryText }]}>Subtotal</Text>
        <Text style={[styles.summaryValue, { color: colors.primaryText }]}>
          KES {subtotal.toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: colors.primaryText }]}>Delivery</Text>
        <Text style={[styles.summaryValue, { color: colors.primaryText }]}>
          {deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}
        </Text>
      </View>
      
      {deliveryFee === 0 && subtotal < 10000 && (
        <View style={styles.freeDeliveryProgress}>
          <Text style={[styles.progressText, { color: colors.metadataText }]}>
            Add KES {(10000 - subtotal).toLocaleString()} more for free delivery
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.borderColor }]}>
            <View 
              style={[
                styles.progressFill,
                { 
                  backgroundColor: colors.primaryGreen,
                  width: `${(subtotal / 10000) * 100}%`
                }
              ]}
            />
          </View>
        </View>
      )}
      
      <View style={[styles.totalRow, { borderTopColor: colors.borderColor }]}>
        <Text style={[styles.totalLabel, { color: colors.primaryText }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.primaryGreen }]}>
          KES {total.toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderPromoCode = () => (
    <View style={[styles.promoContainer, { backgroundColor: colors.white }]}>
      <View style={styles.promoInputContainer}>
        <MaterialIcons name="local-offer" size={20} color={colors.metadataText} />
        <TextInput
          style={[styles.promoInput, { color: colors.primaryText }]}
          placeholder="Enter promo code"
          placeholderTextColor={colors.metadataText}
        />
        <TouchableOpacity style={styles.applyButton}>
          <Text style={[styles.applyText, { color: colors.primaryGreen }]}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCheckoutButton = () => (
    <TouchableOpacity 
      style={[styles.checkoutButton, { backgroundColor: colors.primaryGreen }]}
      disabled={cartItems.length === 0}
    >
      <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      <MaterialIcons name="arrow-forward" size={20} color={colors.white} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="shopping-cart" size={64} color={colors.metadataText} />
      <Text style={[styles.emptyTitle, { color: colors.primaryText }]}>Your cart is empty</Text>
      <Text style={[styles.emptySubtitle, { color: colors.metadataText }]}>
        Add some products to get started
      </Text>
      <TouchableOpacity 
        style={[styles.browseButton, { backgroundColor: colors.primaryGreen }]}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      {renderHeader()}
      
      {cartItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cartList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View>
              {renderPromoCode()}
              {renderSummary()}
              {renderCheckoutButton()}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  itemContent: {
    flexDirection: 'row',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    padding: 4,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  promoContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  promoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    paddingVertical: 8,
  },
  applyButton: {
    padding: 8,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  freeDeliveryProgress: {
    marginVertical: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});