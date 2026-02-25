import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: 'John Kariuki',
        avatar: 'https://via.placeholder.com/40x40',
        location: 'Nakuru County',
        role: 'Farmer',
        verified: true
      },
      content: 'Just harvested 50 bags of organic maize! Quality produce available for sale.',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      likes: 42,
      comments: 8,
      shares: 3,
      saves: 5,
      timestamp: '2 hours ago',
      type: 'harvest',
      liked: false,
      saved: false,
      hashtags: ['#maize', '#organic', '#harvest']
    },
    {
      id: 2,
      author: {
        name: 'Mary Wanjiru',
        avatar: 'https://via.placeholder.com/40x40',
        location: 'Kiambu County',
        role: 'Expert',
        verified: true
      },
      content: 'New dairy cows arrived today! Looking forward to increased milk production. The quality of these Holstein Friesian is exceptional.',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      likes: 28,
      comments: 5,
      shares: 2,
      saves: 3,
      timestamp: '5 hours ago',
      type: 'livestock',
      liked: true,
      saved: false,
      hashtags: ['#cows', '#dairy', '#livestock']
    },
    {
      id: 3,
      author: {
        name: 'Samuel Ochieng',
        avatar: 'https://via.placeholder.com/40x40',
        location: 'Siaya County',
        role: 'Buyer',
        verified: false
      },
      content: 'Looking for suppliers of fresh vegetables for our restaurant chain. We need consistent supply of tomatoes, onions, and leafy greens.',
      likes: 15,
      comments: 3,
      shares: 1,
      saves: 2,
      timestamp: '8 hours ago',
      type: 'marketplace',
      liked: false,
      saved: true,
      hashtags: ['#vegetables', '#supplier', '#restaurant']
    }
  ]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    text: '',
    category: 'general',
    location: 'Current Location',
    hashtags: []
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };
  
  const handleCreatePost = () => {
    if (newPost.text.trim()) {
      const post = {
        id: posts.length + 1,
        author: {
          name: user?.name || 'Current User',
          avatar: user?.avatar || 'https://via.placeholder.com/40x40',
          location: newPost.location,
          role: 'Farmer',
          verified: true
        },
        content: newPost.text,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        timestamp: 'Just now',
        type: newPost.category,
        liked: false,
        saved: false,
        hashtags: newPost.hashtags
      };
      
      setPosts([post, ...posts]);
      setNewPost({ text: '', category: 'general', location: 'Current Location', hashtags: [] });
      setShowCreateModal(false);
    }
  };
  
  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } 
        : post
    ));
  };
  
  const toggleSave = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, saved: !post.saved, saves: post.saved ? post.saves - 1 : post.saves + 1 } 
        : post
    ));
  };
  
  const renderPost = ({ item: post }: { item: any }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          <View style={styles.authorDetails}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              {post.author.verified && (
                <MaterialIcons name="verified" size={16} color="#1B5E20" />
              )}
            </View>
            <Text style={styles.roleText}>{post.author.role}</Text>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={14} color="#666666" />
              <Text style={styles.locationText}>{post.author.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postText}>{post.content}</Text>
        {post.image && (
          <Image source={{ uri: post.image }} style={styles.postImage} />
        )}
        
        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            {post.hashtags.map((tag: string, index: number) => (
              <TouchableOpacity key={index} style={styles.hashtag}>
                <Text style={styles.hashtagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Post Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>{post.type.replace('-', ' ')}</Text>
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(post.id)}>
            <MaterialIcons 
              name={post.liked ? "favorite" : "favorite-border"} 
              size={20} 
              color={post.liked ? "#FF4444" : "#666666"} 
            />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="chat-bubble-outline" size={20} color="#666666" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="share" size={20} color="#666666" />
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={() => toggleSave(post.id)}>
          <MaterialIcons 
            name={post.saved ? "bookmark" : "bookmark-border"} 
            size={20} 
            color={post.saved ? "#1B5E20" : "#666666"} 
          />
        </TouchableOpacity>
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>{post.timestamp}</Text>
    </View>
  );
  
  const renderCreatePost = () => (
    <View style={styles.createPostCard}>
      <View style={styles.createPostHeader}>
        <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/40x40' }} style={styles.smallAvatar} />
        <TouchableOpacity 
          style={styles.createPostInput} 
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createPostPlaceholder}>Start a post…</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <MaterialIcons name="photo-camera" size={20} color="#1B5E20" />
          <Text style={styles.quickActionText}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <MaterialIcons name="video-call" size={20} color="#1B5E20" />
          <Text style={styles.quickActionText}>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <MaterialIcons name="sell" size={20} color="#1B5E20" />
          <Text style={styles.quickActionText}>Sell</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <MaterialIcons name="search" size={20} color="#666666" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search feed..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.appTitle}>MkulimaNet</Text>
        <View style={styles.headerIcons}>
          {renderSearchBar()}
          <TouchableOpacity>
            <MaterialIcons name="notifications" size={24} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <View>
            {renderCreatePost()}
            
            {/* Weather Mini Card */}
            <View style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <MaterialIcons name="wb-sunny" size={20} color="#FFA500" />
                <Text style={styles.weatherLocation}>Nakuru, KE</Text>
              </View>
              <Text style={styles.temperature}>28°C</Text>
              <Text style={styles.weatherCondition}>Sunny</Text>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetailItem}>
                  <MaterialIcons name="water-drop" size={14} color="#666666" />
                  <Text style={styles.weatherDetailText}>65% Humidity</Text>
                </View>
                <View style={styles.weatherDetailItem}>
                  <MaterialIcons name="air" size={14} color="#666666" />
                  <Text style={styles.weatherDetailText}>12 km/h Wind</Text>
                </View>
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="sentiment-dissatisfied" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>Be the first to share something!</Text>
          </View>
        }
      />
      
      {/* Create Post Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <MaterialIcons name="close" size={24} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreatePost} disabled={!newPost.text.trim()}>
              <Text style={[styles.postButtonText, !newPost.text.trim() && styles.disabledPostButton]}>Post</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.modalAuthorRow}>
              <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/40x40' }} style={styles.avatar} />
              <View>
                <Text style={styles.authorName}>{user?.name || 'Current User'}</Text>
                <Text style={styles.locationText}>{newPost.location}</Text>
              </View>
            </View>
            
            <TextInput
              style={styles.modalTextInput}
              placeholder="What's on your mind?"
              multiline
              value={newPost.text}
              onChangeText={(text) => setNewPost({...newPost, text})}
            />
            
            <View style={styles.modalOptions}>
              <View style={styles.optionRow}>
                <TouchableOpacity style={styles.optionButton}>
                  <MaterialIcons name="photo-camera" size={20} color="#1B5E20" />
                  <Text style={styles.optionText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                  <MaterialIcons name="video-call" size={20} color="#1B5E20" />
                  <Text style={styles.optionText}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                  <MaterialIcons name="location-on" size={20} color="#1B5E20" />
                  <Text style={styles.optionText}>Location</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.categorySelector}>
                <Text style={styles.categoryLabel}>Category:</Text>
                <View style={styles.categoryButtons}>
                  {['general', 'crop', 'livestock', 'marketplace', 'jobs'].map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        newPost.category === category && styles.selectedCategoryButton
                      ]}
                      onPress={() => setNewPost({...newPost, category})}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        newPost.category === category && styles.selectedCategoryButtonText
                      ]}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  weatherCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginLeft: 8,
  },
  temperature: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '31%',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111111',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  feedHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  feedContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  postContent: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 14,
    color: '#111111',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  typeBadge: {
    backgroundColor: '#1B5E20',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  saveButton: {
    padding: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
  
  // New styles for enhanced feed
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  createPostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  createPostInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createPostPlaceholder: {
    fontSize: 14,
    color: '#999999',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  hashtag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  hashtagText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '500',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
  },
  disabledPostButton: {
    color: '#CCCCCC',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTextInput: {
    minHeight: 120,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  modalOptions: {
    marginTop: 'auto',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  categorySelector: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#1B5E20',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666666',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
});