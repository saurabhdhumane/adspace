import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { AuthProvider, useAuth } from './app/context/AuthContext';
import { AuthScreen } from './app/screens/AuthScreen';
import { MyListingsScreen } from './app/screens/MyListingsScreen';
import { AddEditListingScreen } from './app/screens/AddEditListingScreen';
import { ListingDetailScreen } from './app/screens/ListingDetailScreen';
import { InboxScreen } from './app/screens/InboxScreen';
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
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
        tabBarIcon: ({ color }) => {
          let icon = '📋';
          if (route.name === 'MyListings') icon = '📋';
          if (route.name === 'Inbox') icon = '📥';
          if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 18, color }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'Listings' }} />
      <Tab.Screen name="Inbox" component={InboxScreen} options={{ title: 'Inbox' }} />
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
              name="AddEditListing"
              component={AddEditListingScreen}
              options={({ route }: any) => ({
                title: route.params?.banner ? 'Edit Listing' : 'Publish Banner Space',
              })}
            />
            <Stack.Screen
              name="ListingDetail"
              component={ListingDetailScreen}
              options={{ title: 'Listing Management' }}
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
