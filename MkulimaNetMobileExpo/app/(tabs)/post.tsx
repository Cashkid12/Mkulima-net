import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PostScreen() {
  const handlePostType = (type: string) => {
    Alert.alert('Create Post', `Posting ${type} coming soon`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you like to do?</Text>
      
      <TouchableOpacity style={styles.optionCard} onPress={() => handlePostType('Crop')}>
        <Ionicons name="leaf" size={32} color="#1B8E3E" />
        <Text style={styles.optionTitle}>Post Crop</Text>
        <Text style={styles.optionDesc}>Sell your harvest</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionCard} onPress={() => handlePostType('Livestock')}>
        <Ionicons name="paw" size={32} color="#1B8E3E" />
        <Text style={styles.optionTitle}>Sell Livestock</Text>
        <Text style={styles.optionDesc}>List your animals</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionCard} onPress={() => handlePostType('Product')}>
        <Ionicons name="cart" size={32} color="#1B8E3E" />
        <Text style={styles.optionTitle}>Sell Product</Text>
        <Text style={styles.optionDesc}>Seeds, equipment & more</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionCard} onPress={() => handlePostType('Job')}>
        <Ionicons name="briefcase" size={32} color="#1B8E3E" />
        <Text style={styles.optionTitle}>Post Job</Text>
        <Text style={styles.optionDesc}>Hire farm workers</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionCard} onPress={() => handlePostType('Advice')}>
        <Ionicons name="chatbubbles" size={32} color="#1B8E3E" />
        <Text style={styles.optionTitle}>Share Advice</Text>
        <Text style={styles.optionDesc}>Help the community</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginLeft: 16,
    flex: 1,
  },
  optionDesc: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 16,
  },
});
