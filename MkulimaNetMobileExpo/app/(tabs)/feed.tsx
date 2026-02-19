import React, { useState } from 'react';
import { StyleSheet, ScrollView, FlatList, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';

export default function FeedScreen() {
  const [posts] = useState([
    {
      id: 1,
      author: {
        name: 'John Kariuki',
        avatar: 'https://via.placeholder.com/40x40',
        location: 'Nakuru County'
      },
      content: 'Just harvested 50 bags of organic maize! Quality produce available for sale.',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      likes: 42,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago',
      type: 'harvest',
      liked: false,
      saved: false,
    },
    {
      id: 2,
      author: {
        name: 'Mary Wanjiru',
        avatar: 'https://via.placeholder.com/40x40',
        location: 'Kiambu County'
      },
      content: 'New dairy cows arrived today! Looking forward to increased milk production.',
      image: 'https://images.unsplash.com/photo-1595280151135-7ae8f7d55681?w=600',
      likes: 28,
      comments: 5,
      shares: 2,
      timestamp: '5 hours ago',
      type: 'livestock',
      liked: true,
      saved: false,
    }
  ]);

  const renderPost = ({ item: post }: { item: any }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <View style={styles.locationRow}>
              <FontAwesome name="map-marker" size={14} color="#666666" />
              <Text style={styles.locationText}>{post.author.location}</Text>
            </View>
          </View>
        </View>
        <FontAwesome name="ellipsis-v" size={24} color="#666666" />
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postText}>{post.content}</Text>
        <Image source={{ uri: post.image }} style={styles.postImage} />
      </View>

      {/* Post Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>{post.type.replace('-', ' ')}</Text>
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.actionGroup}>
          <View style={styles.actionButton}>
            <FontAwesome 
              name={post.liked ? "heart" : "heart-o"} 
              size={20} 
              color={post.liked ? "#FF4444" : "#666666"} 
            />
            <Text style={styles.actionText}>{post.likes}</Text>
          </View>
          
          <View style={styles.actionButton}>
            <FontAwesome name="comment-o" size={20} color="#666666" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </View>
          
          <View style={styles.actionButton}>
            <FontAwesome name="share" size={20} color="#666666" />
            <Text style={styles.actionText}>{post.shares}</Text>
          </View>
        </View>
        
        <View style={styles.saveButton}>
          <FontAwesome 
            name={post.saved ? "bookmark" : "bookmark-o"} 
            size={20} 
            color={post.saved ? "#1B5E20" : "#666666"} 
          />
        </View>
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>{post.timestamp}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Weather Mini Card */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <FontAwesome name="sun-o" size={20} color="#FFA500" />
          <Text style={styles.weatherLocation}>Nakuru, KE</Text>
        </View>
        <Text style={styles.temperature}>28°C</Text>
        <Text style={styles.weatherCondition}>Sunny</Text>
        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetailItem}>
            <FontAwesome name="tint" size={14} color="#666666" />
            <Text style={styles.weatherDetailText}>65% Humidity</Text>
          </View>
          <View style={styles.weatherDetailItem}>
            <FontAwesome name="bolt" size={14} color="#666666" />
            <Text style={styles.weatherDetailText}>12 km/h Wind</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1,242</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>856</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Feed Header */}
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>Latest from the community</Text>
      </View>
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={() => {}}
        scrollEnabled={false}
      />
    </ScrollView>
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
});