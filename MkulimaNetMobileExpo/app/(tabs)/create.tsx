import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CreateScreen() {
  const router = useRouter();

  const actions = [
    { id: 'post', title: 'Create Post', icon: 'chat', color: '#1B5E20' },
    { id: 'job', title: 'Post Job', icon: 'work', color: '#3B82F6' },
    { id: 'product', title: 'Add Product', icon: 'store', color: '#F59E0B' },
    { id: 'community', title: 'Community', icon: 'groups', color: '#8B5CF6' },
  ];

  const handleAction = (actionId: string) => {
    switch(actionId) {
      case 'post':
        router.push('/create-post');
        break;
      case 'job':
        router.push('/post-job');
        break;
      case 'product':
        router.push('/create-marketplace-listing');
        break;
      case 'community':
        // Handle community creation
        break;
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      onRequestClose={() => {}}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={() => router.back()}
      >
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="close" size={24} color="#666666" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Create New</Text>
          <Text style={styles.subtitle}>Choose an action to get started</Text>
          
          <View style={styles.actionsContainer}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleAction(action.id)}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <MaterialIcons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
  },
});