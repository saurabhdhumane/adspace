import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Banner, formatPrice, BookedSlot } from '@adspace/shared';
import { api } from '../services/authStorage';

interface Props {
  navigation: any;
  route: any;
}

export const ListingDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bannerId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-30');
  const [slotNote, setSlotNote] = useState('Direct Booking');
  const [savingSlot, setSavingSlot] = useState(false);

  const { data: banner, isLoading, refetch } = useQuery({
    queryKey: ['banner-detail', bannerId],
    queryFn: async () => {
      const res = await api.getBannerById(bannerId);
      return res.data;
    },
  });

  const handleAddSlot = async () => {
    if (!fromDate || !toDate) {
      Alert.alert('Error', 'From and To dates are required.');
      return;
    }
    setSavingSlot(true);
    try {
      await api.addBookedSlot(bannerId, { from: fromDate, to: toDate, note: slotNote });
      setModalVisible(false);
      refetch();
    } catch (err: any) {
      Alert.alert('Slot Error', err.message || 'Failed to add booked slot');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    Alert.alert('Remove Slot', 'Are you sure you want to free this booked date range?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteBookedSlot(bannerId, slotId);
            refetch();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to remove slot');
          }
        },
      },
    ]);
  };

  if (isLoading || !banner) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  const primaryPhoto = banner.photos[0]?.url || 'https://picsum.photos/800/500';
  const isBusy = banner.status === 'busy';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: primaryPhoto }} style={styles.bannerImage} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{banner.title}</Text>
          <Text style={styles.subtitle}>📍 {banner.location.address}, {banner.location.city}</Text>
        </View>
        <View style={[styles.statusBadge, isBusy ? styles.busyBadge : styles.availableBadge]}>
          <Text style={[styles.statusText, isBusy ? styles.busyText : styles.availableText]}>
            {isBusy ? 'BUSY' : 'AVAILABLE'}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>PRICE</Text>
          <Text style={styles.gridValue}>
            {formatPrice(banner.price.amount, banner.price.currency, banner.price.per)}
          </Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>DIMENSIONS</Text>
          <Text style={styles.gridValue}>
            {banner.dimensions.width}x{banner.dimensions.height} {banner.dimensions.unit}
          </Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>ILLUMINATION</Text>
          <Text style={styles.gridValue}>{banner.illumination.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>VIEWS</Text>
          <Text style={styles.gridValue}>👁️ {banner.viewCount}</Text>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Booked Date Ranges ({banner.bookedSlots?.length || 0})</Text>
        <TouchableOpacity style={styles.addSlotBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addSlotBtnText}>+ Add Slot</Text>
        </TouchableOpacity>
      </View>

      {banner.bookedSlots && banner.bookedSlots.length > 0 ? (
        banner.bookedSlots.map((slot: BookedSlot, idx) => (
          <View key={slot._id || idx} style={styles.slotCard}>
            <View>
              <Text style={styles.slotDates}>
                📅 {new Date(slot.from).toLocaleDateString()} — {new Date(slot.to).toLocaleDateString()}
              </Text>
              {slot.note ? <Text style={styles.slotNote}>{slot.note}</Text> : null}
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteSlot(slot._id || (slot as any).id)}
              style={styles.deleteSlotBtn}
            >
              <Text style={styles.deleteSlotText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noSlotsText}>No booked slots. This space is currently free for advertising.</Text>
      )}

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('AddEditListing', { banner })}
      >
        <Text style={styles.editBtnText}>✏️ Edit Listing Details</Text>
      </TouchableOpacity>

      {/* Add Slot Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Booked Slot</Text>

            <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="2026-09-01"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={toDate}
              onChangeText={setToDate}
              placeholder="2026-09-30"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.label}>Note / Client Name</Text>
            <TextInput
              style={styles.input}
              value={slotNote}
              onChangeText={setSlotNote}
              placeholder="Direct advertiser booking"
              placeholderTextColor="#64748B"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveModalBtn]}
                onPress={handleAddSlot}
                disabled={savingSlot}
              >
                {savingSlot ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveModalText}>Save Slot</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    maxWidth: 240,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38BDF8',
  },
  addSlotBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addSlotBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  slotCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  slotDates: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  slotNote: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  deleteSlotBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#7F1D1D',
    borderRadius: 8,
  },
  deleteSlotText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
  },
  noSlotsText: {
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  editBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  editBtnText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelModalBtn: {
    backgroundColor: '#334155',
    marginRight: 8,
  },
  saveModalBtn: {
    backgroundColor: '#0284C7',
    marginLeft: 8,
  },
  cancelModalText: {
    color: '#CBD5E1',
    fontWeight: '700',
  },
  saveModalText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
