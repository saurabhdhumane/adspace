import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Banner, formatPrice } from '@adspace/shared';
import { api } from '../services/authStorage';

interface Props {
  navigation: any;
}

export const MyListingsScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-banners'],
    queryFn: async () => {
      const res = await api.getMyBanners();
      return res.data || [];
    },
  });

  const renderItem = ({ item }: { item: Banner }) => {
    const primaryPhoto = item.photos.find((p) => p.isPrimary)?.url || item.photos[0]?.url || 'https://picsum.photos/400/250';
    const isBusy = item.status === 'busy';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ListingDetail', { bannerId: item.id || item._id })}
      >
        <Image source={{ uri: primaryPhoto }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, isBusy ? styles.busyBadge : styles.availableBadge]}>
              <Text style={[styles.statusText, isBusy ? styles.busyText : styles.availableText]}>
                {isBusy ? 'BUSY' : 'AVAILABLE'}
              </Text>
            </View>
            <Text style={styles.typeText}>{item.type.replace('_', ' ').toUpperCase()}</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardLocation} numberOfLines={1}>
            📍 {item.location.address}, {item.location.city}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.priceText}>{formatPrice(item.price.amount, item.price.currency, item.price.per)}</Text>
            <Text style={styles.viewsText}>👁️ {item.viewCount} views</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Banner Inventory</Text>
        <Text style={styles.headerSubtitle}>Manage listings, booked slots & availability</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#38BDF8" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Listings Yet</Text>
              <Text style={styles.emptyText}>Tap the '+' button below to publish your first banner space.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditListing', { banner: null })}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availableBadge: {
    backgroundColor: '#064E3B',
  },
  busyBadge: {
    backgroundColor: '#7F1D1D',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  availableText: {
    color: '#34D399',
  },
  busyText: {
    color: '#FCA5A5',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#38BDF8',
  },
  viewsText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '400',
    marginTop: -2,
  },
});
