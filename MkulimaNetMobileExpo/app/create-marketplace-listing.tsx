import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Picker } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function CreateMarketplaceListingScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('crops');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('new');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { label: 'Crops', value: 'crops' },
    { label: 'Livestock', value: 'livestock' },
    { label: 'Agrovet Products', value: 'agrovet' },
    { label: 'Farm Equipment', value: 'equipment' },
    { label: 'Seeds', value: 'seeds' },
  ];

  const conditions = [
    { label: 'New', value: 'new' },
    { label: 'Used', value: 'used' },
    { label: 'Excellent', value: 'excellent' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
  ];

  const handleCreateListing = async () => {
    if (!productName || !description || !price || !quantity || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      const listingData = {
        name: productName,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category,
        location,
        condition,
        ...(image && { image }),
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(listingData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Product listed successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', error.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <TouchableOpacity 
          style={styles.postButton} 
          onPress={handleCreateListing}
          disabled={isLoading}
        >
          <Text style={styles.postButtonText}>
            {isLoading ? 'Creating...' : 'List'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={productName}
            onChangeText={setProductName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your product, its features, and benefits..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Price (KES) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Condition *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={condition}
              onValueChange={setCondition}
              style={styles.picker}
            >
              {conditions.map((cond) => (
                <Picker.Item key={cond.value} label={cond.label} value={cond.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your location (county/town)"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.mediaSection}>
          <TouchableOpacity style={styles.mediaButton}>
            <FontAwesome name="camera" size={20} color="#1B5E20" />
            <Text style={styles.mediaButtonText}>Add Product Photos</Text>
          </TouchableOpacity>
          
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewText}>Image uploaded</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreateListing}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating Listing...' : 'Create Listing'}
          </Text>
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
  postButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  mediaButtonText: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  imagePreviewText: {
    fontSize: 14,
    color: '#1B5E20',
  },
  createButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});