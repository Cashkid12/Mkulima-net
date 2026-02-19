import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function MessagesScreen() {
  const { authState } = useAuth();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    // Load conversations from backend
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      // Simulate API call to get conversations
      const response = await fetch(`http://localhost:5000/api/messages/conversations/${authState.user.id}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem}>
      <Image source={{ uri: item.partner.avatar }} style={styles.avatar} />
      <View style={styles.conversationInfo}>
        <Text style={styles.partnerName}>{item.partner.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.lastMessage.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111111',
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
});