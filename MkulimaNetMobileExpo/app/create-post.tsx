import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function CreatePostScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [postType, setPostType] = useState<'text' | 'photo' | 'video' | 'article'>('text');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    try {
      setIsLoading(true);

      const postData = {
        content,
        postType,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        ...(image && { image }),
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Post created successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          style={styles.postButton} 
          onPress={handleCreatePost}
          disabled={isLoading}
        >
          <Text style={styles.postButtonText}>
            {isLoading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.postTypeSelector}>
          <TouchableOpacity 
            style={[styles.postTypeButton, postType === 'text' && styles.activePostTypeButton]}
            onPress={() => setPostType('text')}
          >
            <Text style={[styles.postTypeText, postType === 'text' && styles.activePostTypeText]}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.postTypeButton, postType === 'photo' && styles.activePostTypeButton]}
            onPress={() => setPostType('photo')}
          >
            <Text style={[styles.postTypeText, postType === 'photo' && styles.activePostTypeText]}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.postTypeButton, postType === 'video' && styles.activePostTypeButton]}
            onPress={() => setPostType('video')}
          >
            <Text style={[styles.postTypeText, postType === 'video' && styles.activePostTypeText]}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.postTypeButton, postType === 'article' && styles.activePostTypeButton]}
            onPress={() => setPostType('article')}
          >
            <Text style={[styles.postTypeText, postType === 'article' && styles.activePostTypeText]}>Article</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.textArea}
            placeholder="What's on your mind? Share your farming experience, tips, or news..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
          />
        </View>

        {postType !== 'text' && (
          <View style={styles.mediaSection}>
            <TouchableOpacity style={styles.mediaButton}>
              <FontAwesome name="camera" size={20} color="#1B5E20" />
              <Text style={styles.mediaButtonText}>Add Photo/Video</Text>
            </TouchableOpacity>
            
            {image && (
              <Image source={{ uri: image }} style={styles.previewImage} />
            )}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., #organicfarming, #croprotation, #pestcontrol"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        <TouchableOpacity 
          style={styles.publishButton} 
          onPress={handleCreatePost}
          disabled={isLoading}
        >
          <Text style={styles.publishButtonText}>
            {isLoading ? 'Publishing...' : 'Publish Post'}
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  postButton: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  postTypeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  postTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePostTypeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postTypeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  activePostTypeText: {
    color: '#1B5E20',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  mediaButtonText: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
    marginLeft: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  publishButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});