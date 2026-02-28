import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateListingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [productInfo, setProductInfo] = useState({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    condition: 'New',
    brand: '',
    quantity: '1',
    price: '',
    comparePrice: '',
    taxInclusive: true,
    minOrder: '1',
    stock: '1',
    lowStockAlert: '5',
    pickupLocation: 'Nakuru, Kenya',
    deliveryOptions: {
      pickup: true,
      sellerDelivery: false,
      localDelivery: false,
      nationwide: false
    },
    deliveryCosts: {
      seller: '',
      local: '',
      nationwide: ''
    },
    deliveryTime: '1-2 days',
    visibility: 'Public',
    boost: false,
    feature: false,
    urgent: false
  });

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

  const steps = [
    { number: 1, title: 'Category & Photos' },
    { number: 2, title: 'Product Details' },
    { number: 3, title: 'Pricing' },
    { number: 4, title: 'Shipping' },
    { number: 5, title: 'Preview' }
  ];

  const categories = [
    'Livestock', 'Crops & Produce', 'Farm Inputs', 'Machinery & Equipment', 
    'Tools & Supplies', 'Services', 'Other'
  ];

  const conditions = ['New', 'Like New', 'Used - Good', 'Used - Fair', 'Refurbished'];

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={[styles.stepTitle, { color: colors.primaryText }]}>List New Item</Text>
      <View style={styles.stepsContainer}>
        {steps.map((step) => (
          <View key={step.number} style={styles.stepItem}>
            <View 
              style={[
                styles.stepCircle,
                { 
                  backgroundColor: currentStep >= step.number ? colors.primaryGreen : colors.borderColor
                }
              ]}
            >
              <Text 
                style={[
                  styles.stepNumber,
                  { color: currentStep >= step.number ? colors.white : colors.metadataText }
                ]}
              >
                {step.number}
              </Text>
            </View>
            <Text 
              style={[
                styles.stepText,
                { color: currentStep >= step.number ? colors.primaryGreen : colors.metadataText }
              ]}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Category *</Text>
        <TouchableOpacity 
          style={[styles.dropdown, { backgroundColor: colors.lightGray }]}
          onPress={() => {/* Open category picker */}}
        >
          <Text style={[styles.dropdownText, { color: productInfo.category ? colors.primaryText : colors.metadataText }]}>
            {productInfo.category || 'Select Main Category'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.metadataText} />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Subcategory</Text>
        <TouchableOpacity 
          style={[styles.dropdown, { backgroundColor: colors.lightGray }]}
          onPress={() => {/* Open subcategory picker */}}
        >
          <Text style={[styles.dropdownText, { color: productInfo.subcategory ? colors.primaryText : colors.metadataText }]}>
            {productInfo.subcategory || 'Select Subcategory'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.metadataText} />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Product Photos (Required) *</Text>
        <View style={styles.photosGrid}>
          <TouchableOpacity 
            style={[styles.photoUpload, { backgroundColor: colors.lightGray, borderColor: colors.secondaryGreen }]}
          >
            <MaterialIcons name="add-a-photo" size={32} color={colors.secondaryGreen} />
            <Text style={[styles.photoText, { color: colors.metadataText }]}>Add Photos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.photoUpload, { backgroundColor: colors.lightGray, borderColor: colors.secondaryGreen }]}
          >
            <MaterialIcons name="videocam" size={32} color={colors.secondaryGreen} />
            <Text style={[styles.photoText, { color: colors.metadataText }]}>Add Video</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.photoNote, { color: colors.metadataText }]}>
          Upload up to 10 photos. First photo is cover image.
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Product Title *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={productInfo.title}
            onChangeText={(text) => setProductInfo({...productInfo, title: text})}
            placeholder="Clear, descriptive title"
            placeholderTextColor={colors.metadataText}
          />
        </View>
        <Text style={[styles.helperText, { color: colors.metadataText }]}>
          Include brand, model, and key features
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Description *</Text>
        <TextInput
          style={[styles.textarea, { backgroundColor: colors.lightGray, color: colors.primaryText }]}
          value={productInfo.description}
          onChangeText={(text) => setProductInfo({...productInfo, description: text})}
          placeholder="Describe your product in detail..."
          placeholderTextColor={colors.metadataText}
          multiline
          numberOfLines={6}
        />
        <Text style={[styles.helperText, { color: colors.metadataText }]}>
          Minimum 30 characters. Include condition, specifications, and usage instructions.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Condition *</Text>
        <View style={styles.chipContainer}>
          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.chip,
                { 
                  backgroundColor: productInfo.condition === condition ? colors.primaryGreen : colors.lightGray,
                  borderColor: productInfo.condition === condition ? colors.primaryGreen : colors.borderColor
                }
              ]}
              onPress={() => setProductInfo({...productInfo, condition: condition})}
            >
              <Text 
                style={[
                  styles.chipText,
                  { color: productInfo.condition === condition ? colors.white : colors.metadataText }
                ]}
              >
                {condition}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Brand (Optional)</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={productInfo.brand}
            onChangeText={(text) => setProductInfo({...productInfo, brand: text})}
            placeholder="Brand name"
            placeholderTextColor={colors.metadataText}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Quantity Available *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={productInfo.quantity}
            onChangeText={(text) => setProductInfo({...productInfo, quantity: text})}
            placeholder="Number of items"
            placeholderTextColor={colors.metadataText}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Price *</Text>
        <View style={[styles.priceInput, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.currency, { color: colors.metadataText }]}>KES</Text>
          <TextInput
            style={[styles.input, { color: colors.primaryText, flex: 1 }]}
            value={productInfo.price}
            onChangeText={(text) => setProductInfo({...productInfo, price: text})}
            placeholder="0"
            placeholderTextColor={colors.metadataText}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Compare at price (Optional)</Text>
        <View style={[styles.priceInput, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.currency, { color: colors.metadataText }]}>KES</Text>
          <TextInput
            style={[styles.input, { color: colors.primaryText, flex: 1 }]}
            value={productInfo.comparePrice}
            onChangeText={(text) => setProductInfo({...productInfo, comparePrice: text})}
            placeholder="Original price"
            placeholderTextColor={colors.metadataText}
            keyboardType="numeric"
          />
        </View>
        <Text style={[styles.helperText, { color: colors.metadataText }]}>
          Shows original price with strikethrough
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Tax/VAT</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setProductInfo({...productInfo, taxInclusive: true})}
          >
            <View 
              style={[
                styles.radioButton,
                { 
                  borderColor: productInfo.taxInclusive ? colors.primaryGreen : colors.borderColor,
                  backgroundColor: productInfo.taxInclusive ? colors.primaryGreen : 'transparent'
                }
              ]}
            >
              {productInfo.taxInclusive && (
                <MaterialIcons name="check" size={16} color={colors.white} />
              )}
            </View>
            <Text style={[styles.radioLabel, { color: colors.primaryText }]}>Inclusive of tax</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => setProductInfo({...productInfo, taxInclusive: false})}
          >
            <View 
              style={[
                styles.radioButton,
                { 
                  borderColor: !productInfo.taxInclusive ? colors.primaryGreen : colors.borderColor,
                  backgroundColor: !productInfo.taxInclusive ? colors.primaryGreen : 'transparent'
                }
              ]}
            >
              {!productInfo.taxInclusive && (
                <MaterialIcons name="check" size={16} color={colors.white} />
              )}
            </View>
            <Text style={[styles.radioLabel, { color: colors.primaryText }]}>Exclusive of tax</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.halfInput, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.label, { color: colors.primaryText, marginBottom: 8 }]}>
            Minimum Order
          </Text>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={productInfo.minOrder}
            onChangeText={(text) => setProductInfo({...productInfo, minOrder: text})}
            placeholder="1"
            placeholderTextColor={colors.metadataText}
            keyboardType="numeric"
          />
        </View>
        
        <View style={[styles.halfInput, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.label, { color: colors.primaryText, marginBottom: 8 }]}>
            Available Stock
          </Text>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={productInfo.stock}
            onChangeText={(text) => setProductInfo({...productInfo, stock: text})}
            placeholder="50"
            placeholderTextColor={colors.metadataText}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Low Stock Alert</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={productInfo.lowStockAlert}
            onChangeText={(text) => setProductInfo({...productInfo, lowStockAlert: text})}
            placeholder="5"
            placeholderTextColor={colors.metadataText}
            keyboardType="numeric"
          />
        </View>
        <Text style={[styles.helperText, { color: colors.metadataText }]}>
          Get notified when stock reaches this level
        </Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Pickup Location</Text>
        <TouchableOpacity 
          style={[styles.locationInput, { backgroundColor: colors.lightGray }]}
          onPress={() => {/* Open location picker */}}
        >
          <MaterialIcons name="location-on" size={20} color={colors.secondaryGreen} />
          <Text style={[styles.locationText, { color: colors.primaryText }]}>
            {productInfo.pickupLocation}
          </Text>
          <MaterialIcons name="edit" size={20} color={colors.metadataText} />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Delivery Options</Text>
        <View style={styles.checkboxGroup}>
          {[
            { key: 'pickup', label: 'Pickup Only (Free)' },
            { key: 'sellerDelivery', label: 'Seller Arranged Delivery' },
            { key: 'localDelivery', label: 'Delivery within Nakuru' },
            { key: 'nationwide', label: 'Nationwide Delivery' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.checkboxOption}
              onPress={() => setProductInfo({
                ...productInfo,
                deliveryOptions: {
                  ...productInfo.deliveryOptions,
                  [option.key]: !productInfo.deliveryOptions[option.key as keyof typeof productInfo.deliveryOptions]
                }
              })}
            >
              <View 
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: productInfo.deliveryOptions[option.key as keyof typeof productInfo.deliveryOptions] 
                      ? colors.primaryGreen 
                      : 'transparent',
                    borderColor: productInfo.deliveryOptions[option.key as keyof typeof productInfo.deliveryOptions] 
                      ? colors.primaryGreen 
                      : colors.borderColor
                  }
                ]}
              >
                {productInfo.deliveryOptions[option.key as keyof typeof productInfo.deliveryOptions] && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.primaryText }]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {(productInfo.deliveryOptions.sellerDelivery || 
        productInfo.deliveryOptions.localDelivery || 
        productInfo.deliveryOptions.nationwide) && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.primaryText }]}>Delivery Costs</Text>
          {productInfo.deliveryOptions.sellerDelivery && (
            <View style={[styles.deliveryInput, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.deliveryLabel, { color: colors.metadataText }]}>Seller Delivery</Text>
              <TextInput
                style={[styles.input, { color: colors.primaryText, flex: 1 }]}
                value={productInfo.deliveryCosts.seller}
                onChangeText={(text) => setProductInfo({
                  ...productInfo,
                  deliveryCosts: { ...productInfo.deliveryCosts, seller: text }
                })}
                placeholder="KES"
                placeholderTextColor={colors.metadataText}
                keyboardType="numeric"
              />
            </View>
          )}
          {productInfo.deliveryOptions.localDelivery && (
            <View style={[styles.deliveryInput, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.deliveryLabel, { color: colors.metadataText }]}>Local Delivery</Text>
              <TextInput
                style={[styles.input, { color: colors.primaryText, flex: 1 }]}
                value={productInfo.deliveryCosts.local}
                onChangeText={(text) => setProductInfo({
                  ...productInfo,
                  deliveryCosts: { ...productInfo.deliveryCosts, local: text }
                })}
                placeholder="KES"
                placeholderTextColor={colors.metadataText}
                keyboardType="numeric"
              />
            </View>
          )}
          {productInfo.deliveryOptions.nationwide && (
            <View style={[styles.deliveryInput, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.deliveryLabel, { color: colors.metadataText }]}>Nationwide</Text>
              <TextInput
                style={[styles.input, { color: colors.primaryText, flex: 1 }]}
                value={productInfo.deliveryCosts.nationwide}
                onChangeText={(text) => setProductInfo({
                  ...productInfo,
                  deliveryCosts: { ...productInfo.deliveryCosts, nationwide: text }
                })}
                placeholder="KES"
                placeholderTextColor={colors.metadataText}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Delivery Time</Text>
        <View style={styles.chipContainer}>
          {['Same day', '1-2 days', '3-5 days', '1 week+'].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.chip,
                { 
                  backgroundColor: productInfo.deliveryTime === time ? colors.primaryGreen : colors.lightGray,
                  borderColor: productInfo.deliveryTime === time ? colors.primaryGreen : colors.borderColor
                }
              ]}
              onPress={() => setProductInfo({...productInfo, deliveryTime: time})}
            >
              <Text 
                style={[
                  styles.chipText,
                  { color: productInfo.deliveryTime === time ? colors.white : colors.metadataText }
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Preview & Publish</Text>
      
      <View style={[styles.previewCard, { backgroundColor: colors.lightGray }]}>
        <Text style={[styles.previewTitle, { color: colors.primaryText }]}>
          {productInfo.title || 'Product Title'}
        </Text>
        <Text style={[styles.previewPrice, { color: colors.primaryGreen }]}>
          KES {productInfo.price || '0'}
        </Text>
        <Text style={[styles.previewLocation, { color: colors.metadataText }]}>
          {productInfo.pickupLocation}
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Visibility</Text>
        <View style={styles.radioGroup}>
          {['Public', 'Verified Buyers Only', 'Wholesale Only'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOption}
              onPress={() => setProductInfo({...productInfo, visibility: option})}
            >
              <View 
                style={[
                  styles.radioButton,
                  { 
                    borderColor: productInfo.visibility === option ? colors.primaryGreen : colors.borderColor,
                    backgroundColor: productInfo.visibility === option ? colors.primaryGreen : 'transparent'
                  }
                ]}
              >
                {productInfo.visibility === option && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={[styles.radioLabel, { color: colors.primaryText }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Promotion (Optional)</Text>
        <View style={styles.promotionOptions}>
          <TouchableOpacity
            style={styles.promotionOption}
            onPress={() => setProductInfo({...productInfo, boost: !productInfo.boost})}
          >
            <View 
              style={[
                styles.checkbox,
                { 
                  backgroundColor: productInfo.boost ? colors.primaryGreen : 'transparent',
                  borderColor: productInfo.boost ? colors.primaryGreen : colors.borderColor
                }
              ]}
            >
              {productInfo.boost && (
                <MaterialIcons name="check" size={16} color={colors.white} />
              )}
            </View>
            <View style={styles.promotionInfo}>
              <Text style={[styles.promotionText, { color: colors.primaryText }]}>
                Boost listing for 7 days
              </Text>
              <Text style={[styles.promotionCost, { color: colors.metadataText }]}>
                KES 200
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.promotionOption}
            onPress={() => setProductInfo({...productInfo, feature: !productInfo.feature})}
          >
            <View 
              style={[
                styles.checkbox,
                { 
                  backgroundColor: productInfo.feature ? colors.primaryGreen : 'transparent',
                  borderColor: productInfo.feature ? colors.primaryGreen : colors.borderColor
                }
              ]}
            >
              {productInfo.feature && (
                <MaterialIcons name="check" size={16} color={colors.white} />
              )}
            </View>
            <View style={styles.promotionInfo}>
              <Text style={[styles.promotionText, { color: colors.primaryText }]}>
                Feature in category
              </Text>
              <Text style={[styles.promotionCost, { color: colors.metadataText }]}>
                KES 150
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.promotionOption}
            onPress={() => setProductInfo({...productInfo, urgent: !productInfo.urgent})}
          >
            <View 
              style={[
                styles.checkbox,
                { 
                  backgroundColor: productInfo.urgent ? colors.primaryGreen : 'transparent',
                  borderColor: productInfo.urgent ? colors.primaryGreen : colors.borderColor
                }
              ]}
            >
              {productInfo.urgent && (
                <MaterialIcons name="check" size={16} color={colors.white} />
              )}
            </View>
            <View style={styles.promotionInfo}>
              <Text style={[styles.promotionText, { color: colors.primaryText }]}>
                Urgent badge
              </Text>
              <Text style={[styles.promotionCost, { color: colors.metadataText }]}>
                KES 50
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.totalContainer, { backgroundColor: colors.lightGray }]}>
        <Text style={[styles.totalLabel, { color: colors.primaryText }]}>Listing Fee</Text>
        <Text style={[styles.totalAmount, { color: colors.success }]}>FREE</Text>
      </View>
      
      {productInfo.boost && (
        <View style={[styles.totalContainer, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.totalLabel, { color: colors.primaryText }]}>Boost Fee</Text>
          <Text style={[styles.totalAmount, { color: colors.primaryGreen }]}>KES 200</Text>
        </View>
      )}
      
      <View style={[styles.totalContainer, { backgroundColor: colors.lightGray }]}>
        <Text style={[styles.totalLabel, { color: colors.primaryText }]}>Total</Text>
        <Text style={[styles.totalAmount, { color: productInfo.boost ? colors.primaryGreen : colors.metadataText }]}>
          KES {productInfo.boost ? '200' : '0'}
        </Text>
      </View>
    </View>
  );

  const renderNavigation = () => (
    <View style={[styles.navigation, { backgroundColor: colors.white }]}>
      {currentStep > 1 && (
        <TouchableOpacity 
          style={[styles.navButton, styles.backButton]}
          onPress={() => setCurrentStep(currentStep - 1)}
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.primaryGreen} />
          <Text style={[styles.navButtonText, { color: colors.primaryGreen }]}>Back</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={[styles.navButton, styles.continueButton, { backgroundColor: colors.primaryGreen }]}
        onPress={() => {
          if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
          } else {
            // Publish listing
          }
        }}
      >
        <Text style={styles.continueText}>
          {currentStep < 5 ? 'Continue' : 'Publish Listing'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity style={styles.backButtonHeader}>
          <MaterialIcons name="arrow-back" size={24} color={colors.metadataText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Create Listing</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderStepIndicator()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </ScrollView>
      
      {renderNavigation()}
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  stepIndicator: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  photoUpload: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  photoText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  photoNote: {
    fontSize: 12,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
  },
  textarea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  halfInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  radioGroup: {
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  checkboxGroup: {
    gap: 16,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  deliveryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 120,
  },
  previewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewPrice: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewLocation: {
    fontSize: 14,
  },
  promotionOptions: {
    gap: 16,
  },
  promotionOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promotionInfo: {
    flex: 1,
  },
  promotionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  promotionCost: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 16,
  },
  continueButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});