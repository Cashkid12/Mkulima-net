import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// Define the props type for TabBarIcon
type TabBarIconProps = {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
};

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon({ name, color, size = 28 }: TabBarIconProps) {
  return <FontAwesome size={size} style={{ marginBottom: -3 }} name={name} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1B5E20', // Professional green color
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F5F5F5',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="rss" color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="briefcase" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '+',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="plus-circle" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="envelope" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}