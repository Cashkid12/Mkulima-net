import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';

export default function CreateScreen() {
  const [modalVisible, setModalVisible] = useState(true);

  const handleAction = (action: string) => {
    setModalVisible(false);
    // Navigate to the appropriate screen based on action
    // This would typically involve navigation to a form screen
    console.log(`Selected action: ${action}`);
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.handle} />
            
            <TouchableOpacity 
              style={styles.actionOption}
              onPress={() => handleAction('post')}
            >
              <FontAwesome name="rss" size={24} color="#1B5E20" />
              <Text style={styles.actionText}>Create Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionOption}
              onPress={() => handleAction('job')}
            >
              <FontAwesome name="briefcase" size={24} color="#1B5E20" />
              <Text style={styles.actionText}>Post Job</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionOption}
              onPress={() => handleAction('product')}
            >
              <FontAwesome name="shopping-cart" size={24} color="#1B5E20" />
              <Text style={styles.actionText}>Add Marketplace Product</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionOption}
              onPress={() => handleAction('community')}
            >
              <FontAwesome name="users" size={24} color="#1B5E20" />
              <Text style={styles.actionText}>Create Community</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionOption, styles.cancelOption]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: 400,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#111111',
    marginLeft: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
  },
});