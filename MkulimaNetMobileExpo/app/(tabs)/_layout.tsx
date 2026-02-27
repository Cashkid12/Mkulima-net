import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const [unreadMessages, setUnreadMessages] = useState(5);
  const [cartItems, setCartItems] = useState(3);
  const [newJobMatches, setNewJobMatches] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const scaleValue = new Animated.Value(1);

  // Professional color palette
  const colors = {
    primaryGreen: '#2E7D32',
    secondaryGreen: '#4CAF50',
    white: '#FFFFFF',
    lightGray: '#9E9E9E',
    mediumGray: '#BDBDBD',
    shadowColor: 'rgba(0,0,0,0.03)',
  };

  const handleTabPress = (tabName: string) => {
    // Add haptic feedback and scale animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1.0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderBadge = (count: number | boolean, type: 'dot' | 'number' | 'online' = 'number') => {
    if (type === 'dot' && count) {
      return (
        <View style={[styles.badge, styles.dotBadge, { backgroundColor: colors.secondaryGreen }]} />
      );
    }
    
    if (type === 'online' && count) {
      return (
        <View style={[styles.badge, styles.onlineBadge, { backgroundColor: colors.secondaryGreen }]} />
      );
    }
    
    if (typeof count === 'number' && count > 0) {
      return (
        <View style={[styles.badge, { backgroundColor: colors.primaryGreen }]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count.toString()}</Text>
        </View>
      );
    }
    
    return null;
  };

  const TabIcon = ({ 
    name, 
    focused, 
    badgeCount, 
    badgeType = 'number',
    size = 24 
  }: { 
    name: string; 
    focused: boolean; 
    badgeCount?: number | boolean;
    badgeType?: 'dot' | 'number' | 'online';
    size?: number;
  }) => (
    <View style={styles.iconContainer}>
      <MaterialIcons
        name={name as any}
        size={focused ? size + 2 : size}
        color={focused ? colors.primaryGreen : colors.lightGray}
      />
      {badgeCount !== undefined && renderBadge(badgeCount, badgeType)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveTintColor: colors.primaryGreen,
          tabBarInactiveTintColor: colors.mediumGray,
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                name={focused ? "home" : "home-outlined"} 
                focused={focused}
                size={24}
              />
            ),
            tabBarAccessibilityLabel: 'Feed tab, double tap to open',
            tabBarTestID: 'feed-tab',
          }}
          listeners={{
            tabPress: () => handleTabPress('feed'),
          }}
        />
        
        <Tabs.Screen
          name="jobs"
          options={{
            title: 'Jobs+',
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                name={focused ? "work" : "work-outline"} 
                focused={focused}
                badgeCount={newJobMatches}
                badgeType="dot"
                size={24}
              />
            ),
            tabBarAccessibilityLabel: 'Jobs tab, double tap to open',
            tabBarTestID: 'jobs-tab',
          }}
          listeners={{
            tabPress: () => handleTabPress('jobs'),
          }}
        />
        
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Marketplace',
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                name={focused ? "store" : "store-outlined"} 
                focused={focused}
                badgeCount={cartItems}
                size={24}
              />
            ),
            tabBarAccessibilityLabel: 'Marketplace tab, double tap to open',
            tabBarTestID: 'marketplace-tab',
          }}
          listeners={{
            tabPress: () => handleTabPress('marketplace'),
          }}
        />
        
        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                name={focused ? "account-balance-wallet" : "account-balance-wallet-outlined"} 
                focused={focused}
                size={24}
              />
            ),
            tabBarAccessibilityLabel: 'Wallet tab, double tap to open',
            tabBarTestID: 'wallet-tab',
          }}
          listeners={{
            tabPress: () => handleTabPress('wallet'),
          }}
        />
        
        <Tabs.Screen
          name="portfolio"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                name={focused ? "dashboard" : "dashboard-outlined"} 
                focused={focused}
                size={24}
              />
            ),
            tabBarAccessibilityLabel: 'Portfolio tab, double tap to open',
            tabBarTestID: 'portfolio-tab',
          }}
          listeners={{
            tabPress: () => handleTabPress('portfolio'),
          }}
        />
        
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                name={focused ? "chat" : "chat-outlined"} 
                focused={focused}
                badgeCount={unreadMessages}
                size={24}
              />
            ),
            tabBarAccessibilityLabel: 'Messages tab, double tap to open',
            tabBarTestID: 'messages-tab',
          }}
          listeners={{
            tabPress: () => handleTabPress('messages'),
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                name={focused ? "person" : "person-outline"} 
                focused={focused}
                badgeCount={isOnline}
                badgeType="online"
                size={24}
              />
            ),
            tabBarAccessibilityLabel: 'Profile tab, double tap to open',
            tabBarTestID: 'profile-tab',
          }}
          listeners={{
            tabPress: () => handleTabPress('profile'),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    height: 70,
    paddingBottom: 12,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    top: 0,
    right: 0,
  },
  onlineBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    top: 0,
    right: 0,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});