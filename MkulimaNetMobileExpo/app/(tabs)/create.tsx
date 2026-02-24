import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateScreen() {
  const router = useRouter();

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  const handleCreateMarketplaceListing = () => {
    router.push('/create-marketplace-listing');
  };

  const handlePostJob = () => {
    router.push('/post-job');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="add-circle-outline" size={64} color="#1B5E20" style={styles.icon} />
        <Text style={styles.title}>Create Content</Text>
        <Text style={styles.subtitle}>Choose what you'd like to create</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={handleCreatePost}>
            <MaterialIcons name="chat-bubble-outline" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Create Post</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionButton} onPress={handleCreateMarketplaceListing}>
            <MaterialIcons name="shopping-cart" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Create Listing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionButton} onPress={handlePostJob}>
            <MaterialIcons name="work-outline" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Post a Job</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});