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
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Banner, formatPrice, BANNER_TYPES, POPULAR_CITIES } from '@adspace/shared';
import { api } from '../services/authStorage';

interface Props {
  navigation: any;
}

export const ExploreListScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [availableNow, setAvailableNow] = useState(false);
  const [sortOption, setSortOption] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['explore-list-banners', selectedCity, selectedType, availableNow, sortOption],
    queryFn: async () => {
      const res = await api.getBanners({
        city: selectedCity,
        type: selectedType as any,
        availableNow,
        sort: sortOption,
      });
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
        onPress={() => navigation.navigate('BannerDetail', { bannerId: item.id || item._id })}
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

          <View style={styles.specsRow}>
            <Text style={styles.specItem}>📐 {item.dimensions.width}x{item.dimensions.height} {item.dimensions.unit}</Text>
            <Text style={styles.specItem}>💡 {item.illumination.replace('_', ' ')}</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.priceText}>{formatPrice(item.price.amount, item.price.currency, item.price.per)}</Text>
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => navigation.navigate('BannerDetail', { bannerId: item.id || item._id })}
            >
              <Text style={styles.detailsBtnText}>Inspect & Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Banner Spaces</Text>
          <TouchableOpacity style={styles.mapToggleBtn} onPress={() => navigation.navigate('ExploreMap')}>
            <Text style={styles.mapToggleText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>

        {/* City Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCity && styles.activeFilterChip]}
            onPress={() => setSelectedCity(undefined)}
          >
            <Text style={[styles.filterChipText, !selectedCity && styles.activeFilterChipText]}>All Cities</Text>
          </TouchableOpacity>
          {POPULAR_CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.filterChip, selectedCity === city && styles.activeFilterChip]}
              onPress={() => setSelectedCity(selectedCity === city ? undefined : city)}
            >
              <Text style={[styles.filterChipText, selectedCity === city && styles.activeFilterChipText]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type & Availability Filter */}
        <View style={styles.secondaryFilterRow}>
          <TouchableOpacity
            style={[styles.toggleAvailBtn, availableNow && styles.activeToggleAvailBtn]}
            onPress={() => setAvailableNow(!availableNow)}
          >
            <Text style={[styles.toggleAvailText, availableNow && styles.activeToggleAvailText]}>
              {availableNow ? '✅ Free Now Only' : '⚡ All Spaces'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => {
              if (sortOption === 'newest') setSortOption('price_asc');
              else if (sortOption === 'price_asc') setSortOption('price_desc');
              else setSortOption('newest');
            }}
          >
            <Text style={styles.sortBtnText}>
              Sort: {sortOption === 'price_asc' ? 'Low → High' : sortOption === 'price_desc' ? 'High → Low' : 'Newest'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#34D399" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Spaces Found</Text>
              <Text style={styles.emptyText}>Try resetting your city or availability filters.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  mapToggleBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mapToggleText: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeFilterChip: {
    backgroundColor: '#059669',
    borderColor: '#34D399',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  secondaryFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  toggleAvailBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeToggleAvailBtn: {
    backgroundColor: '#064E3B',
    borderColor: '#34D399',
  },
  toggleAvailText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeToggleAvailText: {
    color: '#34D399',
  },
  sortBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sortBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
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
    marginBottom: 8,
  },
  specsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  specItem: {
    color: '#94A3B8',
    fontSize: 12,
    marginRight: 16,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#34D399',
  },
  detailsBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
  },
});
