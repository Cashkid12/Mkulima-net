import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal, Pressable } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AgriculturalProfileScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [primaryActivities, setPrimaryActivities] = useState({
    cropFarming: false,
    dairyFarming: false,
    poultry: false,
    horticulture: false,
    fishFarming: false,
  });
  const [yearsExperience, setYearsExperience] = useState('');
  const [certifications, setCertifications] = useState({
    organic: false,
    gap: false,
    kenyaGap: false,
  });
  const [languages, setLanguages] = useState({
    english: false,
    swahili: false,
    kikuyu: false,
    luo: false,
  });
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showCustomCertification, setShowCustomCertification] = useState(false);
  const [customCert, setCustomCert] = useState('');

  // Experience options
  const experienceOptions = [
    'Less than 1 year',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    '10-20 years',
    'More than 20 years',
  ];

  // Handle saving agricultural profile
  const handleSaveAgriculturalProfile = async () => {
    try {
      // Get existing metadata
      const existingMetadata = user?.publicMetadata || {};
      
      // Update user metadata with agricultural profile
      await user?.setPublicMetadata({
        ...existingMetadata,
        farmName: farmName,
        farmSize: farmSize,
        primaryActivities: Object.keys(primaryActivities).filter(key => primaryActivities[key]),
        yearsExperience: yearsExperience,
        certifications: {
          ...existingMetadata.certifications,
          organic: certifications.organic,
          gap: certifications.gap,
          kenyaGap: certifications.kenyaGap,
          custom: customCert,
        },
        languagesSpoken: Object.keys(languages).filter(key => languages[key]),
        agriculturalProfileComplete: true,
      });

      // Navigate to dashboard
      router.push('/(tabs)/feed');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while saving your agricultural profile');
    }
  };

  // Toggle primary activity
  const toggleActivity = (activity: keyof typeof primaryActivities) => {
    setPrimaryActivities(prev => ({
      ...prev,
      [activity]: !prev[activity]
    }));
  };

  // Toggle certification
  const toggleCertification = (cert: keyof typeof certifications) => {
    setCertifications(prev => ({
      ...prev,
      [cert]: !prev[cert]
    }));
  };

  // Toggle language
  const toggleLanguage = (lang: keyof typeof languages) => {
    setLanguages(prev => ({
      ...prev,
      [lang]: !prev[lang]
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agricultural Profile</Text>
        <Text style={styles.subtitle}>Complete your farming details</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Farm/Business Name</Text>
        <TextInput
          style={styles.textInput}
          value={farmName}
          onChangeText={setFarmName}
          placeholder="Green Valley Farm"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Farm Size</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.textInput, { flex: 1, marginRight: 10 }]}
            value={farmSize}
            onChangeText={setFarmSize}
            placeholder="12"
            keyboardType="numeric"
          />
          <Text style={styles.unitLabel}>Acres</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Primary Activities</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleActivity('cropFarming')}>
            <View style={[styles.checkbox, primaryActivities.cropFarming && styles.checkboxChecked]}>
              {primaryActivities.cropFarming && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Crop Farming</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleActivity('dairyFarming')}>
            <View style={[styles.checkbox, primaryActivities.dairyFarming && styles.checkboxChecked]}>
              {primaryActivities.dairyFarming && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Dairy Farming</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleActivity('poultry')}>
            <View style={[styles.checkbox, primaryActivities.poultry && styles.checkboxChecked]}>
              {primaryActivities.poultry && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Poultry</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleActivity('horticulture')}>
            <View style={[styles.checkbox, primaryActivities.horticulture && styles.checkboxChecked]}>
              {primaryActivities.horticulture && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Horticulture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleActivity('fishFarming')}>
            <View style={[styles.checkbox, primaryActivities.fishFarming && styles.checkboxChecked]}>
              {primaryActivities.fishFarming && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Fish Farming</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Years of Experience</Text>
        <TouchableOpacity
          style={styles.selectContainer}
          onPress={() => setShowExperienceModal(true)}
        >
          <Text style={[styles.selectText, !yearsExperience && styles.placeholderText]}>
            {yearsExperience || 'Select years of experience'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#757575" />
        </TouchableOpacity>

        {/* Experience selection modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showExperienceModal}
          onRequestClose={() => setShowExperienceModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowExperienceModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Years of Experience</Text>
              {experienceOptions.map((option, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.modalOption,
                    pressed && styles.modalOptionPressed,
                  ]}
                  onPress={() => {
                    setYearsExperience(option);
                    setShowExperienceModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Certifications</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleCertification('organic')}>
            <View style={[styles.checkbox, certifications.organic && styles.checkboxChecked]}>
              {certifications.organic && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Organic Certified</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleCertification('gap')}>
            <View style={[styles.checkbox, certifications.gap && styles.checkboxChecked]}>
              {certifications.gap && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Good Agricultural Practices (GAP)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleCertification('kenyaGap')}>
            <View style={[styles.checkbox, certifications.kenyaGap && styles.checkboxChecked]}>
              {certifications.kenyaGap && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Kenya GAP</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setShowCustomCertification(true)}>
            <View style={styles.checkbox}>
              <Ionicons name="add" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.checkboxLabel}>Add Custom Certification</Text>
          </TouchableOpacity>
        </View>

        {/* Custom certification modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCustomCertification}
          onRequestClose={() => setShowCustomCertification(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCustomCertification(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Custom Certification</Text>
              <TextInput
                style={styles.modalInput}
                value={customCert}
                onChangeText={setCustomCert}
                placeholder="Enter certification name"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCustomCertification(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={() => {
                    setShowCustomCertification(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Languages Spoken</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleLanguage('english')}>
            <View style={[styles.checkbox, languages.english && styles.checkboxChecked]}>
              {languages.english && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>English</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleLanguage('swahili')}>
            <View style={[styles.checkbox, languages.swahili && styles.checkboxChecked]}>
              {languages.swahili && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Swahili</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleLanguage('kikuyu')}>
            <View style={[styles.checkbox, languages.kikuyu && styles.checkboxChecked]}>
              {languages.kikuyu && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Kikuyu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => toggleLanguage('luo')}>
            <View style={[styles.checkbox, languages.luo && styles.checkboxChecked]}>
              {languages.luo && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>Luo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveAgriculturalProfile}
      >
        <Text style={styles.saveButtonText}>Save Agricultural Profile</Text>
        <Ionicons name="checkmark-circle" size={20} color="white" style={styles.checkIcon} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitLabel: {
    fontSize: 16,
    color: '#222222',
    alignSelf: 'center',
  },
  checkboxContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#2E7D32',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#222222',
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  selectText: {
    fontSize: 16,
    color: '#222222',
  },
  placeholderText: {
    color: '#9E9E9E',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  checkIcon: {
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222222',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionPressed: {
    backgroundColor: '#F5F5F5',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#222222',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    marginLeft: 5,
  },
  cancelButtonText: {
    color: '#222222',
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});