import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

interface VerificationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: string[];
  earned: boolean;
  earnedDate?: string;
  progress: number;
}

interface VerificationRequest {
  id: string;
  type: 'identity' | 'business' | 'quality' | 'premium';
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  submittedDate: string;
  reviewedDate?: string;
  documents: string[];
  notes?: string;
}

export default function VerificationScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState<'badges' | 'requests' | 'verification'>('badges');

  const badges: VerificationBadge[] = [
    {
      id: '1',
      name: 'Verified User',
      description: 'Identity verified through government documents',
      icon: 'shield-check',
      color: 'blue',
      requirements: ['Government ID', 'Selfie verification', 'Phone number verification'],
      earned: true,
      earnedDate: '2024-01-15',
      progress: 100
    },
    {
      id: '2',
      name: 'Verified Business',
      description: 'Business registration and license verified',
      icon: 'award',
      color: 'green',
      requirements: ['Business registration', 'Tax compliance certificate', 'Business license'],
      earned: false,
      progress: 60
    },
    {
      id: '3',
      name: 'Quality Producer',
      description: 'Products meet quality standards',
      icon: 'star',
      color: 'yellow',
      requirements: ['Quality certification', 'Product testing reports', 'Farm inspection'],
      earned: false,
      progress: 30
    },
    {
      id: '4',
      name: 'Premium Seller',
      description: 'Top-rated seller with excellent reviews',
      icon: 'emoji-events',
      color: 'purple',
      requirements: ['95%+ positive reviews', '100+ completed transactions', 'No disputes'],
      earned: false,
      progress: 75
    }
  ];

  const verificationRequests: VerificationRequest[] = [
    {
      id: '1',
      type: 'identity',
      status: 'approved',
      submittedDate: '2024-01-10',
      reviewedDate: '2024-01-15',
      documents: ['id_front.jpg', 'id_back.jpg', 'selfie.jpg'],
      notes: 'Identity verification completed successfully'
    },
    {
      id: '2',
      type: 'business',
      status: 'pending',
      submittedDate: '2024-02-01',
      documents: ['business_cert.pdf', 'tax_clearance.pdf'],
      notes: 'Awaiting document review'
    }
  ];

  const getBadgeIcon = (icon: string, color: string) => {
    const colorMap: Record<string, string> = {
      blue: '#2196F3',
      green: '#4CAF50',
      yellow: '#FFC107',
      purple: '#9C27B0'
    };

    const iconMap: Record<string, any> = {
      'shield-check': 'verified-user',
      'award': 'award',
      'star': 'star',
      'emoji-events': 'emoji-events'
    };

    return (
      <MaterialIcons 
        name={iconMap[icon] || 'verified-user'} 
        size={24} 
        color={colorMap[color] || '#2196F3'} 
      />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'rejected': return '#F44336';
      case 'in_review': return '#2196F3';
      default: return '#666666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      case 'in_review': return 'In Review';
      default: return 'Unknown';
    }
  };

  const getVerificationTypeText = (type: string) => {
    switch (type) {
      case 'identity': return 'Identity Verification';
      case 'business': return 'Business Verification';
      case 'quality': return 'Quality Certification';
      case 'premium': return 'Premium Seller';
      default: return 'Unknown';
    }
  };

  const requestVerification = (type: string) => {
    Alert.alert(
      'Start Verification',
      `Would you like to start the ${getVerificationTypeText(type as any)} process?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            // Navigate to document upload screen
            router.push(`/verification/upload?type=${type}`);
          }
        }
      ]
    );
  };

  const renderBadges = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Your Verification Badges</Text>
      
      {badges.map((badge) => (
        <View key={badge.id} style={[
          styles.badgeCard,
          badge.earned ? styles.earnedBadge : styles.unearnedBadge
        ]}>
          <View style={styles.badgeHeader}>
            <View style={[
              styles.badgeIcon,
              { backgroundColor: badge.earned ? `${getStatusColor('approved')}20` : '#E0E0E0' }
            ]}>
              {getBadgeIcon(badge.icon, badge.color)}
            </View>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeName}>{badge.name}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
            </View>
            {badge.earned && (
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            )}
          </View>
          
          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>Requirements:</Text>
            {badge.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <MaterialIcons 
                  name={badge.earned || index < Math.floor(badge.requirements.length * badge.progress / 100) ? 'check' : 'radio-button-unchecked'} 
                  size={16} 
                  color={badge.earned || index < Math.floor(badge.requirements.length * badge.progress / 100) ? '#4CAF50' : '#666666'} 
                />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>
          
          {!badge.earned && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${badge.progress}%`, backgroundColor: getStatusColor('in_review') }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{badge.progress}% Complete</Text>
            </View>
          )}
          
          {badge.earned && badge.earnedDate && (
            <Text style={styles.earnedDate}>Earned on {badge.earnedDate}</Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderRequests = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Verification Requests</Text>
      
      {verificationRequests.map((request) => (
        <View key={request.id} style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestTitle}>{getVerificationTypeText(request.type)}</Text>
            <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
              {getStatusText(request.status)}
            </Text>
          </View>
          
          <View style={styles.requestDetails}>
            <Text style={styles.detailText}>Submitted: {request.submittedDate}</Text>
            {request.reviewedDate && (
              <Text style={styles.detailText}>Reviewed: {request.reviewedDate}</Text>
            )}
          </View>
          
          <View style={styles.documentsSection}>
            <Text style={styles.documentsTitle}>Documents:</Text>
            <View style={styles.documentsList}>
              {request.documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <MaterialIcons name="insert-drive-file" size={16} color="#666666" />
                  <Text style={styles.documentText}>{doc}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {request.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesText}>{request.notes}</Text>
            </View>
          )}
          
          <View style={styles.requestActions}>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
            
            {request.status === 'rejected' && (
              <TouchableOpacity 
                style={styles.resubmitButton}
                onPress={() => requestVerification(request.type)}
              >
                <Text style={styles.resubmitText}>Resubmit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderVerificationOptions = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Get Verified</Text>
      <Text style={styles.sectionSubtitle}>Increase your credibility and unlock premium features</Text>
      
      <View style={styles.verificationOptions}>
        {[
          {
            type: 'identity',
            title: 'Identity Verification',
            description: 'Verify your personal identity',
            icon: 'person',
            requirements: ['Government ID', 'Selfie', 'Phone verification'],
            price: 'Free'
          },
          {
            type: 'business',
            title: 'Business Verification',
            description: 'Verify your business credentials',
            icon: 'business',
            requirements: ['Business registration', 'Tax certificate', 'License'],
            price: 'KES 1,500'
          },
          {
            type: 'quality',
            title: 'Quality Certification',
            description: 'Get quality certified',
            icon: 'grade',
            requirements: ['Quality reports', 'Inspection', 'Certification'],
            price: 'KES 3,000'
          },
          {
            type: 'premium',
            title: 'Premium Seller',
            description: 'Become a premium seller',
            icon: 'star',
            requirements: ['High ratings', 'Transaction history', 'No disputes'],
            price: 'KES 5,000'
          }
        ].map((option) => (
          <View key={option.type} style={styles.verificationOption}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                <MaterialIcons name={option.icon as any} size={24} color="#1B5E20" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Text style={styles.optionPrice}>{option.price}</Text>
            </View>
            
            <View style={styles.optionRequirements}>
              <Text style={styles.requirementsTitle}>Requirements:</Text>
              {option.requirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <MaterialIcons name="check" size={12} color="#4CAF50" />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => requestVerification(option.type)}
            >
              <Text style={styles.startButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trust & Verification</Text>
        <Text style={styles.headerSubtitle}>Build trust with verification badges</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'badges' && styles.activeTab]}
          onPress={() => setActiveTab('badges')}
        >
          <MaterialIcons 
            name="award" 
            size={20} 
            color={activeTab === 'badges' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>
            Badges
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <MaterialIcons 
            name="list-alt" 
            size={20} 
            color={activeTab === 'requests' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'verification' && styles.activeTab]}
          onPress={() => setActiveTab('verification')}
        >
          <MaterialIcons 
            name="verified-user" 
            size={20} 
            color={activeTab === 'verification' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.tabText, activeTab === 'verification' && styles.activeTabText]}>
            Verify
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'badges' && renderBadges()}
      {activeTab === 'requests' && renderRequests()}
      {activeTab === 'verification' && renderVerificationOptions()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#1B5E20',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  earnedBadge: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  unearnedBadge: {
    borderLeftWidth: 4,
    borderLeftColor: '#CCCCCC',
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  badgeDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  requirementsSection: {
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    alignSelf: 'flex-end',
  },
  earnedDate: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  documentsSection: {
    marginBottom: 12,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  documentsList: {
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  documentText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  notesSection: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#1976D2',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  resubmitButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  resubmitText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  verificationOptions: {
    marginBottom: 20,
  },
  verificationOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  optionRequirements: {
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#1B5E20',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});