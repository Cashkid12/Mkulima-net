import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, Modal, Pressable } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSetupScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('farmer');
  const [location, setLocation] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [charactersLeft, setCharactersLeft] = useState(200);

  // Handle image picking
  const pickImage = async () => {
    // Request permission for photo library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
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

  // Handle bio change
  const handleBioChange = (text: string) => {
    if (text.length <= 200) {
      setBio(text);
      setCharactersLeft(200 - text.length);
    }
  };

  // Handle saving profile
  const handleSaveProfile = async () => {
    try {
      // Update user profile with Clerk (critical for navigation)
      await user?.update({
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' '),
      });

      // If there's a profile image, upload it separately
      if (profileImage) {
        await user?.setProfileImage({
          file: { uri: profileImage } as any,
        });
      }

      // Store additional metadata in Clerk (critical for navigation)
      await user?.setPublicMetadata({
        role: role,
        location: location,
        bio: bio,
        completedProfile: true,
        usernameSet: true,
        joinedVia: 'email', // This would be dynamic based on auth method
      });

      // Sync profile data with backend API (non-critical for navigation)
      try {
        const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://mkulima-net.onrender.com').replace(/\/$/, '');
        const profileResponse = await fetch(`${baseUrl}/api/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user?.getIdToken()}`,
          },
          body: JSON.stringify({
            bio: bio,
            location: location,
            role: role
          }),
        });

        if (!profileResponse.ok) {
          console.warn('Warning: Could not sync profile with backend');
        }
      } catch (error) {
        console.warn('Warning: Could not sync profile with backend', error);
      }

      // Navigate to agricultural profile setup (should happen regardless of backend sync)
      router.push('/auth/agricultural-profile');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while saving your profile');
    }
  };

  // Handle skipping profile setup
  const handleSkipProfile = () => {
    router.push('/(tabs)/feed');
  };

  // Role options
  const roles = [
    { value: 'farmer', label: 'Farmer' },
    { value: 'buyer', label: 'Buyer' },
    { value: 'expert', label: 'Expert' },
  ];

  // Render role selector
  const renderRoleSelector = () => {
    const selectedRole = roles.find(r => r.value === role)?.label || 'Farmer';

    return (
      <View>
        <Text style={styles.label}>Role</Text>
        <TouchableOpacity
          style={styles.selectContainer}
          onPress={() => setShowRoleModal(true)}
        >
          <Text style={styles.selectText}>{selectedRole}</Text>
          <Ionicons name="chevron-down" size={20} color="#757575" />
        </TouchableOpacity>

        {/* Role selection modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRoleModal}
          onRequestClose={() => setShowRoleModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowRoleModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Role</Text>
              {roles.map((item) => (
                <Pressable
                  key={item.value}
                  style={({ pressed }) => [
                    styles.modalOption,
                    pressed && styles.modalOptionPressed,
                  ]}
                  onPress={() => {
                    setRole(item.value);
                    setShowRoleModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Step 2 of 2</Text>
      </View>

      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePlaceholder}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Ionicons name="camera" size={30} color="#4CAF50" style={styles.cameraIcon} />
          )}
        </TouchableOpacity>
        <Text style={styles.addPhotoText}>Add Photo</Text>
        <Text style={styles.photoHint}>Click to upload</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.textInput}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="John Mwangi"
        />
        <Text style={styles.hint}>Pre-filled from signup</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Bio (Optional)</Text>
        <TextInput
          style={[styles.textArea, { height: 100 }]}
          value={bio}
          onChangeText={handleBioChange}
          placeholder="Farmer in Nakuru, 8 yrs experience in dairy..."
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>{charactersLeft}/200 characters</Text>
      </View>

      {renderRoleSelector()}

      <View style={styles.formSection}>
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity
          style={styles.selectContainer}
          onPress={() => setShowLocationModal(true)}
        >
          <Text style={[styles.selectText, !location && styles.placeholderText]}>
            {location || 'Nakuru, Kenya'}
          </Text>
          <Ionicons name="locate" size={20} color="#757575" />
        </TouchableOpacity>

        {/* Location selection modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLocationModal}
          onRequestClose={() => setShowLocationModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowLocationModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Location</Text>
              <TextInput
                style={styles.modalInput}
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLocationModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={() => setShowLocationModal(false)}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
        >
          <Text style={styles.saveButtonText}>Save & Continue</Text>
          <Ionicons name="checkmark-circle" size={20} color="white" style={styles.checkIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipProfile}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
          <Text style={styles.skipButtonText}>→ Dashboard</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIcon: {
    alignSelf: 'center',
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginTop: 10,
  },
  photoHint: {
    fontSize: 14,
    color: '#757575',
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 8,
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
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  characterCount: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'right',
    marginTop: 5,
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
  buttonContainer: {
    marginTop: 30,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    marginBottom: 15,
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
  skipButton: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
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