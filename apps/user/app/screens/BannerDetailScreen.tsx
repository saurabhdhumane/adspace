import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { Banner, formatPrice, BookedSlot } from '@adspace/shared';
import { api } from '../services/authStorage';
import { InquireModal } from './InquireModal';

interface Props {
  navigation: any;
  route: any;
}

export const BannerDetailScreen: React.FC<Props> = ({ route }) => {
  const { bannerId } = route.params;
  const [inquireModalVisible, setInquireModalVisible] = useState(false);

  const { data: banner, isLoading } = useQuery({
    queryKey: ['advertiser-banner-detail', bannerId],
    queryFn: async () => {
      const res = await api.getBannerById(bannerId);
      return res.data;
    },
  });

  if (isLoading || !banner) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const owner = typeof banner.ownerId === 'object' ? banner.ownerId : null;
  const isBusy = banner.status === 'busy';
  const lat = banner.location.coordinates[1];
  const lng = banner.location.coordinates[0];

  const handleOpenWhatsApp = () => {
    const phone = owner?.phone || '+919876543210';
    const message = `Hi ${owner?.name || 'Owner'}, I'm interested in booking your banner space "${banner.title}" listed on AdSpace.`;
    const url = `whatsapp://send?phone=${phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('WhatsApp Not Installed', `You can contact the owner directly at ${phone}`);
        }
      })
      .catch(() => Alert.alert('Error', `Could not open WhatsApp. Phone: ${phone}`));
  };

  const handleCallPhone = () => {
    const phone = owner?.phone || '+919876543210';
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Gallery */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {banner.photos.map((photo, idx) => (
            <Image key={idx} source={{ uri: photo.url }} style={styles.galleryImage} />
          ))}
        </ScrollView>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.locationText}>📍 {banner.location.address}, {banner.location.city}</Text>
            </View>
            <View style={[styles.statusBadge, isBusy ? styles.busyBadge : styles.availBadge]}>
              <Text style={styles.statusText}>{banner.status.toUpperCase()}</Text>
            </View>
          </View>

          {/* Pricing Box */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>RENTAL RATE</Text>
            <Text style={styles.priceAmount}>
              {formatPrice(banner.price.amount, banner.price.currency, banner.price.per)}
            </Text>
          </View>

          {/* Specifications */}
          <Text style={styles.sectionTitle}>Space Specifications</Text>
          <View style={styles.specGrid}>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>TYPE</Text>
              <Text style={styles.specVal}>{banner.type.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>DIMENSIONS</Text>
              <Text style={styles.specVal}>{banner.dimensions.width}x{banner.dimensions.height} {banner.dimensions.unit}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>ILLUMINATION</Text>
              <Text style={styles.specVal}>{banner.illumination.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={styles.specCard}>
              <Text style={styles.specLabel}>TOTAL VIEWS</Text>
              <Text style={styles.specVal}>👁️ {banner.viewCount}</Text>
            </View>
          </View>

          {banner.trafficNotes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>🚦 Traffic & Visibility</Text>
              <Text style={styles.notesText}>{banner.trafficNotes}</Text>
            </View>
          ) : null}

          {/* Location & Mini Map */}
          <View style={styles.locationHeaderRow}>
            <Text style={styles.sectionTitle}>Location & Directions</Text>
            <TouchableOpacity onPress={handleDirections}>
              <Text style={styles.directionsLink}>Get Directions ↗</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.miniMapContainer}>
            <MapView
              style={styles.miniMap}
              initialRegion={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={{ latitude: lat, longitude: lng }} pinColor="#10B981" />
            </MapView>
          </View>

          {/* Availability Calendar / Shaded Busy Slots */}
          <Text style={styles.sectionTitle}>Availability Calendar</Text>
          {banner.bookedSlots && banner.bookedSlots.length > 0 ? (
            banner.bookedSlots.map((slot: BookedSlot, idx) => (
              <View key={slot._id || idx} style={styles.busySlotRow}>
                <Text style={styles.busySlotText}>
                  🔴 Reserved: {new Date(slot.from).toLocaleDateString()} — {new Date(slot.to).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.freeSlotRow}>
              <Text style={styles.freeSlotText}>🟢 Fully available for upcoming bookings</Text>
            </View>
          )}

          {/* Owner Info */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.avatarText}>{owner?.name?.substring(0, 2).toUpperCase() || 'OW'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{owner?.name || 'Verified Space Owner'}</Text>
              <Text style={styles.ownerCompany}>{owner?.company || 'Listed Publisher'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.iconActionBtn} onPress={handleCallPhone}>
          <Text style={styles.iconActionText}>📞</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconActionBtn, styles.waBtn]} onPress={handleOpenWhatsApp}>
          <Text style={styles.iconActionText}>💬</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.inquireMainBtn} onPress={() => setInquireModalVisible(true)}>
          <Text style={styles.inquireMainText}>Send Inquiry</Text>
        </TouchableOpacity>
      </View>

      <InquireModal
        visible={inquireModalVisible}
        bannerId={banner.id || banner._id}
        onClose={() => setInquireModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  gallery: {
    height: 240,
  },
  galleryImage: {
    width: 380,
    height: 240,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  locationText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  availBadge: {
    backgroundColor: '#064E3B',
  },
  busyBadge: {
    backgroundColor: '#7F1D1D',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  priceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
  },
  priceAmount: {
    color: '#34D399',
    fontWeight: '800',
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#34D399',
    marginTop: 16,
    marginBottom: 12,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  specVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  notesBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  notesTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginBottom: 4,
  },
  notesText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  directionsLink: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 13,
  },
  miniMapContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  miniMap: {
    width: '100%',
    height: '100%',
  },
  busySlotRow: {
    backgroundColor: '#450A0A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#991B1B',
  },
  busySlotText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
  },
  freeSlotRow: {
    backgroundColor: '#064E3B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  freeSlotText: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '600',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  ownerName: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 16,
  },
  ownerCompany: {
    color: '#94A3B8',
    fontSize: 13,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  waBtn: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  iconActionText: {
    fontSize: 20,
  },
  inquireMainBtn: {
    flex: 1,
    backgroundColor: '#059669',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inquireMainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
