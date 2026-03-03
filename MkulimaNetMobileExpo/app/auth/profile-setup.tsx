import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, Pressable } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const kenyaCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Kitale',
  'Garissa', 'Nyeri', 'Meru', 'Kisii', 'Migori', 'Narok', 'Kakamega',
  'Kiambu', 'Machakos', 'Kajiado', 'Bomet', 'Kericho', 'Nyamira', 'Homa Bay',
  'Makueni', 'Kitui', 'Tharaka-Nithi', 'Embu', 'Marsabit', 'Isiolo', 'Wajir',
  'Mandera', 'Marsabit', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet',
  'Nandi', 'Laikipia', 'Nyandarua', 'Kirinyaga', 'Murang\'a', 'Kirinyaga'
];

export default function ProfileSetupScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchCounty, setSearchCounty] = useState('');
  const [charactersLeft, setCharactersLeft] = useState(150);

  const filteredCounties = kenyaCounties.filter(county =>
    county.toLowerCase().includes(searchCounty.toLowerCase())
  );

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleBioChange = (text: string) => {
    if (text.length <= 150) {
      setBio(text);
      setCharactersLeft(150 - text.length);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await user?.update({
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' '),
      });

      if (profileImage) {
        await user?.setProfileImage({
          file: { uri: profileImage } as any,
        });
      }

      await user?.setPublicMetadata({
        location: location,
        bio: bio,
        completedProfile: true,
      });

      // Sync with backend (non-blocking)
      try {
        const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://mkulima-net.onrender.com').replace(/\/$/, '');
        await fetch(`${baseUrl}/api/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user?.getIdToken()}`,
          },
          body: JSON.stringify({ bio, location }),
        });
      } catch (e) {
        console.warn('Backend sync failed', e);
      }

      router.push('/(tabs)/feed');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    }
  };

  const handleSkip = () => {
    router.push('/(tabs)/feed');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.step}>Step 2 of 2</Text>

      {/* Photo Upload */}
      <TouchableOpacity style={styles.photoContainer} onPress={handleImagePick}>
        {profileImage ? (
          <View style={styles.photoWrapper}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={50} color="#757575" />
            </View>
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={32} color="#2E7D32" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
            <Text style={styles.optionalText}>(Optional)</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Display Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your display name"
          placeholderTextColor="#757575"
        />
      </View>

      {/* Bio */}
      <View style={styles.field}>
        <Text style={styles.label}>Bio (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={handleBioChange}
          placeholder="Tell us about yourself..."
          placeholderTextColor="#757575"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{charactersLeft}/150 characters</Text>
      </View>

      {/* Location */}
      <View style={styles.field}>
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity
          style={styles.selectContainer}
          onPress={() => setShowLocationModal(true)}
        >
          <Ionicons name="location" size={20} color="#757575" style={styles.selectIcon} />
          <Text style={[styles.selectText, !location && styles.placeholder]}>
            {location || 'Select your location'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* Skip Link */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Ionicons name="flash" size={18} color="#2E7D32" />
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Save & Continue</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>You can always edit later in Profile Settings</Text>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLocationModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search county..."
              placeholderTextColor="#757575"
              value={searchCounty}
              onChangeText={setSearchCounty}
            />
            <ScrollView style={styles.countyList}>
              {filteredCounties.map((county) => (
                <Pressable
                  key={county}
                  style={styles.countyItem}
                  onPress={() => {
                    setLocation(county);
                    setShowLocationModal(false);
                    setSearchCounty('');
                  }}
                >
                  <Text style={styles.countyText}>{county}</Text>
                  {location === county && (
                    <Ionicons name="checkmark" size={20} color="#2E7D32" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
  },
  step: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2E7D32',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  optionalText: {
    fontSize: 12,
    color: '#757575',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222222',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'right',
    marginTop: 4,
  },
  selectContainer: {
    height: 56,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectIcon: {
    marginRight: 12,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: '#222222',
  },
  placeholder: {
    color: '#757575',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  skipText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  saveButton: {
    height: 56,
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  countyList: {
    maxHeight: 300,
  },
  countyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  countyText: {
    fontSize: 16,
    color: '#222222',
  },
});
