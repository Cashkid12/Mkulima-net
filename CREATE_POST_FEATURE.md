# MkulimaNet Create Post Feature

## Overview
The MkulimaNet Create Post feature enables farmers, agrovets, and other agricultural professionals to share updates, images, videos, and tag products, services, or communities. The feature includes real-time capabilities, backend connectivity, and is designed to be scalable for both mobile and web platforms.

## Features

### 1. Post Composition Screen
- **Text Input**: Multiline text area with placeholder "What's happening on your farm?" and character counter (up to 1000 characters)
- **Media Upload**:
  - Support for images (1-5 max per post)
  - Future video support ready
  - Drag-and-drop and mobile gallery selection
- **Tagging Options**:
  - Products: Link to user-owned products in marketplace
  - Services: Connect to user-offered services
  - Communities: Post to joined groups
- **Post Visibility Options**:
  - Public: Visible to all users
  - Followers Only: Visible to followers
  - Community-specific: Visible to members of selected community
- **Location Tag**: Optional farm/county location tagging
- **Hashtags**: Support for #MaizeFarming style hashtags

### 2. Preview & Edit
- Media thumbnails with remove/reorder functionality
- Character count display for text input
- Real-time preview of post composition

### 3. Backend Requirements

#### Post Model Enhancements
The Post model has been enhanced with additional fields:
```javascript
{
  user: ObjectId, // Author of the post
  content: String, // Post content
  media: [String], // Array of media URLs (images/videos)
  productsTagged: [ObjectId], // References to tagged products
  servicesTagged: [ObjectId], // References to tagged services
  communitiesTagged: [ObjectId], // References to tagged communities
  location: String, // County/farm location
  visibility: String, // 'public', 'followers', 'community'
  likes: [ObjectId], // Users who liked the post
  comments: [{ // Comments on the post
    user: ObjectId,
    content: String,
    createdAt: Date
  }],
  sharesCount: Number, // Number of shares
  tags: [String], // Array of hashtags
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
- **POST /api/posts/upload-media** - Upload media for posts (supports up to 5 files, 10MB each)
- **POST /api/posts** - Create a new post with all enhanced fields
- **PUT /api/posts/:id** - Update existing post
- **GET /api/posts/feed** - Get feed posts with proper visibility filtering

### 4. Real-Time Capabilities
- Posts update feeds in real-time after creation
- Like and save actions update immediately
- Notification system integration ready

### 5. Mobile & Web Ready
- Responsive design for all screen sizes
- Touch-friendly interface for mobile devices
- Optimized performance for both platforms

## Implementation Details

### Backend Implementation

#### Media Upload Handling
- Created `postUpload.js` utility for handling post media
- Supports images and videos (currently images implemented)
- File size limits (10MB per file) and type validation
- Stores files in `uploads/posts/` directory

#### Enhanced Post Creation
- Updated POST route to handle all new fields
- Proper validation for content, media, and tagging
- Visibility-based access control

#### Feed Filtering Logic
- Updated feed route to respect visibility settings
- Shows public posts, followed user posts, and community posts
- Includes user's own posts regardless of visibility

### Frontend Implementation

#### Create Post Page
- Comprehensive form with all required fields
- Image preview and management
- Hashtag creation and management
- Visibility selector with icons
- Tagging interfaces for products, services, and communities
- Real-time validation and feedback

#### Accessibility Compliance
- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly interface
- Semantic HTML structure

## Technical Architecture

### Data Flow
1. User composes post with text, media, tags, and settings
2. Media is uploaded to server with proper validation
3. Post is created with all metadata
4. Post appears in appropriate feeds based on visibility
5. Engagement metrics update in real-time

### Security
- JWT authentication required for all post operations
- Authorization checks ensure users can only modify their own posts
- Input validation prevents malicious content
- File upload validation prevents harmful files

### Performance
- Optimized database queries with proper indexing
- Efficient media handling and storage
- Caching for frequently accessed data
- Pagination for large datasets

## Benefits

### For Users
- **Rich Content Sharing**: Ability to share detailed updates with media
- **Targeted Reach**: Control over who sees their posts
- **Business Connections**: Tag products and services to drive sales
- **Community Engagement**: Participate in relevant communities
- **Location Awareness**: Share geographic context of farming activities

### For Platform
- **Increased Engagement**: Richer content leads to more interactions
- **Marketplace Integration**: Direct connection between posts and commerce
- **Community Building**: Enhanced community features foster connections
- **Content Diversity**: Various post types improve feed quality

## Mobile Integration
The feature builds upon the existing CreatePostScreen in the mobile app, enhancing it with:
- All the backend enhancements
- Consistent UX patterns between mobile and web
- Shared API endpoints for seamless synchronization

## Future Enhancements

### Planned Features
- Video upload support
- User mentions (@username)
- Scheduled posts
- Draft saving
- Advanced analytics
- Post sharing between communities
- Poll creation within posts

### Potential Improvements
- AI-powered content suggestions
- Automated hashtag recommendations
- Image recognition for automatic tagging
- Advanced privacy controls
- Cross-platform content synchronization

## Conclusion
The MkulimaNet Create Post feature delivers a professional, scalable solution for agricultural social networking. With real-time capabilities, robust backend connectivity, and mobile/web readiness, it enables farmers and agrovets to effectively share updates, connect with communities, and grow their businesses. The feature integrates seamlessly with existing marketplace and community functionalities, creating a comprehensive agricultural ecosystem.