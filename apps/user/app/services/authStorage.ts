import * as SecureStore from 'expo-secure-store';
import { setApiTokenStorage, TokenStorage, createApiClient, createApiEndpoints } from '@adspace/shared';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'adspace_user_access_token';
const REFRESH_TOKEN_KEY = 'adspace_user_refresh_token';

const memoryStore: Record<string, string> = {};

const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return memoryStore[key] || null;
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return memoryStore[key] || null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    memoryStore[key] = value;
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    memoryStore[key] = value;
  }
};

const deleteItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    delete memoryStore[key];
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    delete memoryStore[key];
  }
};

export const userTokenStorage: TokenStorage = {
  getAccessToken: () => getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getItem(REFRESH_TOKEN_KEY),
  setTokens: async ({ accessToken, refreshToken }) => {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: async () => {
    await deleteItem(ACCESS_TOKEN_KEY);
    await deleteItem(REFRESH_TOKEN_KEY);
  },
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

setApiTokenStorage(userTokenStorage);
export const apiClient = createApiClient(API_BASE_URL);
export const api = createApiEndpoints(apiClient);
