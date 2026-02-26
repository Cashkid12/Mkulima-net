import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Define the props type for TabBarIcon
type TabBarIconProps = {
  name: string;
  color: string;
  size?: number;
};

// Custom TabBar Icon Component with proper sizing
function TabBarIcon({ name, color, size = 24 }: TabBarIconProps) {
  return <MaterialIcons name={name as any} size={size} color={color} />;
}

// Custom Tab Label Component
function TabLabel({ title, isActive }: { title: string; isActive: boolean }) {
  return (
    <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  activeTabLabel: {
    fontWeight: '600',
    color: '#1B5E20',
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E7EB',
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 0,
        },
        headerShown: false, // Clean header
      }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="forum" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="work" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '+',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="add-circle" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Market',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="store" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="account-balance-wallet" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="bar-chart" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="chat" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}