import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/authStorage';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const registerPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Failed to get push notification token.');
        return;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync();
      await api.updatePushToken(tokenData.data);
      Alert.alert('Push Notifications Enabled', 'Device registered for instant inquiry alerts!');
    } catch (err: any) {
      Alert.alert('Notification Setup', err.message || 'Notification registration requires physical device.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.substring(0, 2).toUpperCase() || 'OW'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>Space Owner / Publisher</Text>

        <View style={styles.verifyBadge}>
          <Text style={styles.verifyText}>
            {user?.isVerified ? 'VERIFIED OWNER ✅' : 'PENDING KYC VERIFICATION ⏳'}
          </Text>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user?.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Company</Text>
          <Text style={styles.infoValue}>{user?.company || 'Independent Space Owner'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.pushBtn} onPress={registerPushNotifications}>
        <Text style={styles.pushBtnText}>🔔 Enable Inquiry Push Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  userRole: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 12,
  },
  verifyBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  verifyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  detailsSection: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  pushBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  pushBtnText: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#7F1D1D',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#FCA5A5',
    fontSize: 16,
    fontWeight: '800',
  },
});
