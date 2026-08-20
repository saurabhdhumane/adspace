import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { Banner, formatPrice } from '@adspace/shared';
import { api } from '../services/authStorage';

interface Props {
  navigation: any;
}

export const ExploreMapScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const { data: banners, isLoading } = useQuery({
    queryKey: ['explore-map-banners'],
    queryFn: async () => {
      const res = await api.getBanners({ availableNow: false });
      return res.data || [];
    },
  });

  // Default region centered on Pune / Metro India
  const initialRegion = {
    latitude: 18.5204,
    longitude: 73.8567,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {banners?.map((b) => {
          const lat = b.location.coordinates[1];
          const lng = b.location.coordinates[0];
          const isBusy = b.status === 'busy';

          return (
            <Marker
              key={b.id || b._id}
              coordinate={{ latitude: lat, longitude: lng }}
              pinColor={isBusy ? '#EF4444' : '#10B981'}
              onPress={() => setSelectedBanner(b)}
            />
          );
        })}
      </MapView>

      {/* Top Toggle Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.toggleViewBtn}
          onPress={() => navigation.navigate('ExploreList')}
        >
          <Text style={styles.toggleViewText}>📋 Switch to List View</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : null}

      {/* Bottom Selected Banner Card */}
      {selectedBanner ? (
        <View style={styles.previewCard}>
          <Image
            source={{
              uri: selectedBanner.photos[0]?.url || 'https://picsum.photos/400/250',
            }}
            style={styles.previewImage}
          />
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedBanner.title}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  selectedBanner.status === 'busy' ? styles.busyBadge : styles.availBadge,
                ]}
              >
                <Text style={styles.statusText}>{selectedBanner.status.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.previewLocation} numberOfLines={1}>
              📍 {selectedBanner.location.address}, {selectedBanner.location.city}
            </Text>

            <View style={styles.previewFooter}>
              <Text style={styles.previewPrice}>
                {formatPrice(
                  selectedBanner.price.amount,
                  selectedBanner.price.currency,
                  selectedBanner.price.per
                )}
              </Text>

              <TouchableOpacity
                style={styles.viewDetailBtn}
                onPress={() =>
                  navigation.navigate('BannerDetail', {
                    bannerId: selectedBanner.id || selectedBanner._id,
                  })
                }
              >
                <Text style={styles.viewDetailText}>View Space →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  toggleViewBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toggleViewText: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 30,
  },
  previewCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 8,
  },
  previewImage: {
    width: '100%',
    height: 140,
  },
  previewContent: {
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availBadge: {
    backgroundColor: '#064E3B',
  },
  busyBadge: {
    backgroundColor: '#7F1D1D',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  previewLocation: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#34D399',
  },
  viewDetailBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewDetailText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
