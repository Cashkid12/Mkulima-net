import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Picker, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const jobTypes = [
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Internship', value: 'Internship' },
];

const categories = [
  { label: 'Crops', value: 'Crops' },
  { label: 'Livestock', value: 'Livestock' },
  { label: 'Agribusiness', value: 'Agribusiness' },
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Research', value: 'Research' },
  { label: 'Consulting', value: 'Consulting' },
];

const experienceLevels = [
  { label: 'Entry Level', value: 'Entry Level' },
  { label: 'Mid Level', value: 'Mid Level' },
  { label: 'Senior Level', value: 'Senior Level' },
  { label: 'Expert', value: 'Expert' },
];

const kenyanCounties = [
  { label: 'Nairobi', value: 'Nairobi' },
  { label: 'Mombasa', value: 'Mombasa' },
  { label: 'Kisumu', value: 'Kisumu' },
  { label: 'Nakuru', value: 'Nakuru' },
  { label: 'Kiambu', value: 'Kiambu' },
  { label: 'Kajiado', value: 'Kajiado' },
  { label: 'Machakos', value: 'Machakos' },
  { label: 'Murang\'a', value: 'Murang\'a' },
  { label: 'Nyeri', value: 'Nyeri' },
  { label: 'Kirinyaga', value: 'Kirinyaga' },
  { label: 'Embu', value: 'Embu' },
  { label: 'Meru', value: 'Meru' },
  { label: 'Uasin Gishu', value: 'Uasin Gishu' },
  { label: 'Kericho', value: 'Kericho' },
  { label: 'Bomet', value: 'Bomet' },
  { label: 'Nandi', value: 'Nandi' },
  { label: 'Kakamega', value: 'Kakamega' },
  { label: 'Vihiga', value: 'Vihiga' },
  { label: 'Bungoma', value: 'Bungoma' },
  { label: 'Busia', value: 'Busia' },
  { label: 'Siaya', value: 'Siaya' },
  { label: 'Kisii', value: 'Kisii' },
  { label: 'Nyamira', value: 'Nyamira' },
  { label: 'Migori', value: 'Migori' },
  { label: 'Homa Bay', value: 'Homa Bay' },
  { label: 'Kitui', value: 'Kitui' },
  { label: 'Makueni', value: 'Makueni' },
  { label: 'Taita Taveta', value: 'Taita Taveta' },
  { label: 'Kilifi', value: 'Kilifi' },
  { label: 'Kwale', value: 'Kwale' },
];

export default function PostJobScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    town: '',
    jobType: 'Full-time',
    category: 'Crops',
    salaryAmount: '',
    salaryCurrency: 'KES',
    negotiable: false,
    requiredSkills: '',
    experienceRequired: 'Entry Level',
    description: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Job title is required');
      return;
    }

    if (!formData.companyName.trim()) {
      Alert.alert('Error', 'Company name is required');
      return;
    }

    if (!formData.location.trim()) {
      Alert.alert('Error', 'County is required');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Job description is required');
      return;
    }

    if (!formData.deadline) {
      Alert.alert('Error', 'Application deadline is required');
      return;
    }

    // Check if user is logged in
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'You must be logged in to post a job');
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        title: formData.title.trim(),
        companyName: formData.companyName.trim(),
        location: {
          county: formData.location.trim(),
          town: formData.town.trim()
        },
        jobType: formData.jobType,
        category: formData.category,
        salary: {
          amount: formData.salaryAmount ? parseFloat(formData.salaryAmount) : undefined,
          currency: formData.salaryCurrency,
          negotiable: formData.negotiable
        },
        requiredSkills: formData.requiredSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0),
        experienceRequired: formData.experienceRequired,
        description: formData.description.trim(),
        deadline: formData.deadline
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post job');
      }

      Alert.alert('Success', 'Job posted successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error('Error posting job:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to post job. Please try again.');
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
        <Text style={styles.headerTitle}>Post a Job</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Job Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Agricultural Extension Officer"
            value={formData.title}
            onChangeText={(value) => handleChange('title', value)}
          />

          <Text style={styles.label}>Company/Farm Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Green Valley Farm Ltd"
            value={formData.companyName}
            onChangeText={(value) => handleChange('companyName', value)}
          />

          <Text style={styles.label}>County *</Text>
          <RNView style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.location}
              onValueChange={(value) => handleChange('location', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select County" value="" />
              {kenyanCounties.map(county => (
                <Picker.Item key={county.value} label={county.label} value={county.value} />
              ))}
            </Picker>
          </RNView>

          <Text style={styles.label}>Town</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Nakuru Town"
            value={formData.town}
            onChangeText={(value) => handleChange('town', value)}
          />

          <Text style={styles.label}>Job Type *</Text>
          <RNView style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.jobType}
              onValueChange={(value) => handleChange('jobType', value)}
              style={styles.picker}
            >
              {jobTypes.map(type => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </RNView>

          <Text style={styles.label}>Category *</Text>
          <RNView style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => handleChange('category', value)}
              style={styles.picker}
            >
              {categories.map(category => (
                <Picker.Item key={category.value} label={category.label} value={category.value} />
              ))}
            </Picker>
          </RNView>

          <Text style={styles.label}>Salary Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 50000"
            keyboardType="numeric"
            value={formData.salaryAmount}
            onChangeText={(value) => handleChange('salaryAmount', value)}
          />

          <Text style={styles.label}>Salary Currency</Text>
          <RNView style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.salaryCurrency}
              onValueChange={(value) => handleChange('salaryCurrency', value)}
              style={styles.picker}
            >
              <Picker.Item label="KES" value="KES" />
              <Picker.Item label="USD" value="USD" />
              <Picker.Item label="EUR" value="EUR" />
            </Picker>
          </RNView>

          <Text style={styles.label}>Required Skills</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter required skills separated by commas, e.g., irrigation, pest control, crop rotation"
            value={formData.requiredSkills}
            onChangeText={(value) => handleChange('requiredSkills', value)}
          />

          <Text style={styles.label}>Experience Required</Text>
          <RNView style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.experienceRequired}
              onValueChange={(value) => handleChange('experienceRequired', value)}
              style={styles.picker}
            >
              {experienceLevels.map(level => (
                <Picker.Item key={level.value} label={level.label} value={level.value} />
              ))}
            </Picker>
          </RNView>

          <Text style={styles.label}>Job Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide a detailed description of the job responsibilities, requirements, and any other relevant information..."
            multiline
            numberOfLines={6}
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
          />

          <Text style={styles.label}>Application Deadline *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.deadline}
            onChangeText={(value) => handleChange('deadline', value)}
            keyboardType="default"
          />

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Posting...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Post Job Opportunity</Text>
            )}
          </TouchableOpacity>
        </View>
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
  formSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
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