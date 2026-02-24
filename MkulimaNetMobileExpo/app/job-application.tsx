import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: {
    county: string;
    town?: string;
  };
  jobType: string;
  category: string;
  salary?: {
    amount?: number;
    currency?: string;
    negotiable?: boolean;
  };
  requiredSkills: string[];
  experienceRequired: string;
  description: string;
  deadline: string;
  employerId: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    farmName?: string;
    location?: string;
    verified: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export default function JobApplicationScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!jobId) {
      Alert.alert('Error', 'Invalid job ID');
      return;
    }

    // Check if user is logged in
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'You must be logged in to apply to jobs');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply to job');
      }

      Alert.alert('Success', 'Successfully applied to the job!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error('Error applying to job:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to apply to job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Job</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.jobPreview}>
          <Text style={styles.jobTitle}>Agricultural Manager</Text>
          <Text style={styles.jobCompany}>Green Valley Farm Ltd</Text>
          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <FontAwesome name="map-marker" size={16} color="#666666" />
              <Text style={styles.jobDetail}>Nairobi, Kenya</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome name="briefcase" size={16} color="#666666" />
              <Text style={styles.jobDetail}>Full-time</Text>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell the employer why you're interested in this position and what makes you a great fit..."
            placeholderTextColor="#999999"
            multiline
            numberOfLines={6}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleApply}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Applying...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  jobPreview: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  jobDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobDetail: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});