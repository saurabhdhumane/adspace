import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { AuthProvider, useAuth } from './app/context/AuthContext';
import { AuthScreen } from './app/screens/AuthScreen';
import { ExploreMapScreen } from './app/screens/ExploreMapScreen';
import { ExploreListScreen } from './app/screens/ExploreListScreen';
import { BannerDetailScreen } from './app/screens/BannerDetailScreen';
import { MyInquiriesScreen } from './app/screens/MyInquiriesScreen';
import { ProfileScreen } from './app/screens/ProfileScreen';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#34D399',
        tabBarInactiveTintColor: '#64748B',
        tabBarIcon: ({ color }) => {
          let icon = '🗺️';
          if (route.name === 'ExploreMap') icon = '🗺️';
          if (route.name === 'ExploreList') icon = '📋';
          if (route.name === 'MyInquiries') icon = '📨';
          if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 18, color }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="ExploreMap" component={ExploreMapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="ExploreList" component={ExploreListScreen} options={{ title: 'Browse' }} />
      <Tab.Screen name="MyInquiries" component={MyInquiriesScreen} options={{ title: 'Inquiries' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function MainApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1E293B' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="BannerDetail"
              component={BannerDetailScreen}
              options={{ title: 'Banner Space Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}
