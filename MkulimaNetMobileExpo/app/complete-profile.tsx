import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState(authState.user?.location || '');
  const [farmingCategory, setFarmingCategory] = useState('');
  const [skills, setSkills] = useState('');
  const [certifications, setCertifications] = useState('');
  const [farmDetails, setFarmDetails] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [livestock, setLivestock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!bio || !location) {
      Alert.alert('Error', 'Please fill in bio and location');
      return;
    }

    try {
      setIsLoading(true);
      
      const profileData = {
        bio,
        location,
        farmingCategory: farmingCategory.split(',').map(cat => cat.trim()).filter(cat => cat),
        skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        certifications: certifications.split(',').map(cert => cert.trim()).filter(cert => cert),
        farmDetails,
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        livestock: livestock.split(',').map(liv => liv.trim()).filter(liv => liv),
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile completed successfully!');
        router.push('/feed');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      Alert.alert('Error', error.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Tell us more about yourself to get started</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us about yourself, your farming journey, and what you're passionate about..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your county/region"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farming Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Crop farming, Livestock, Dairy, Poultry"
            value={farmingCategory}
            onChangeText={setFarmingCategory}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Skills</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Organic farming, Pest control, Marketing (separate with commas)"
            value={skills}
            onChangeText={setSkills}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Certifications</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Organic certification, Food safety (separate with commas)"
            value={certifications}
            onChangeText={setCertifications}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Farm Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Size, crops grown, equipment owned, etc."
            value={farmDetails}
            onChangeText={setFarmDetails}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of years in farming"
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Livestock</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Cattle, Goats, Chicken (separate with commas)"
            value={livestock}
            onChangeText={setLivestock}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveProfile}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Complete Profile'}
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
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
  saveButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});