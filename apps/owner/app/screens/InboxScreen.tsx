import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Inquiry } from '@adspace/shared';
import { api } from '../services/authStorage';

export const InboxScreen: React.FC = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [responding, setResponding] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['received-inquiries'],
    queryFn: async () => {
      const res = await api.getReceivedInquiries();
      return res.data || [];
    },
  });

  const handleRespond = async (status: 'accepted' | 'rejected') => {
    if (!selectedInquiry) return;
    setResponding(true);
    try {
      await api.respondToInquiry(selectedInquiry.id || selectedInquiry._id, {
        status,
        ownerResponse: responseMsg,
      });
      setSelectedInquiry(null);
      setResponseMsg('');
      refetch();
    } catch (err: any) {
      Alert.alert('Response Error', err.message || 'Failed to submit response');
    } finally {
      setResponding(false);
    }
  };

  const renderItem = ({ item }: { item: Inquiry }) => {
    const banner = typeof item.bannerId === 'object' ? item.bannerId : null;
    const advertiser = typeof item.advertiserId === 'object' ? item.advertiserId : null;

    const getStatusStyle = (status: string) => {
      if (status === 'accepted') return { bg: '#064E3B', text: '#34D399' };
      if (status === 'rejected') return { bg: '#7F1D1D', text: '#FCA5A5' };
      return { bg: '#78350F', text: '#FDE047' }; // pending
    };

    const st = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {banner?.title || 'Banner Space Inquiry'}
          </Text>
          <View style={[styles.statusChip, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusText, { color: st.text }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.advertiserInfo}>
          👤 {advertiser?.name || 'Advertiser'} {advertiser?.company ? `(${advertiser.company})` : ''}
        </Text>

        <Text style={styles.dateRangeText}>
          📅 Requested: {new Date(item.requestedRange.from).toLocaleDateString()} —{' '}
          {new Date(item.requestedRange.to).toLocaleDateString()}
        </Text>

        {item.message ? <Text style={styles.messageBox}>"{item.message}"</Text> : null}

        {item.ownerResponse ? (
          <Text style={styles.responseBox}>Your response: "{item.ownerResponse}"</Text>
        ) : null}

        {item.status === 'pending' ? (
          <TouchableOpacity
            style={styles.respondBtn}
            onPress={() => setSelectedInquiry(item)}
          >
            <Text style={styles.respondBtnText}>Respond to Inquiry</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inquiries Inbox</Text>
        <Text style={styles.headerSubtitle}>Advertiser proposals & booking requests</Text>
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
              <Text style={styles.emptyTitle}>No Inquiries Received</Text>
              <Text style={styles.emptyText}>When advertisers request to book your banner spaces, they will appear here.</Text>
            </View>
          }
        />
      )}

      {/* Response Modal */}
      <Modal visible={!!selectedInquiry} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Respond to Advertiser</Text>
            <Text style={styles.modalSubtitle}>
              Accepting will automatically block out the banner's booked calendar range.
            </Text>

            <Text style={styles.label}>Response Note (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              placeholder="e.g. Approved! Please call us at +91 9876543210 for contract execution."
              placeholderTextColor="#64748B"
              value={responseMsg}
              onChangeText={setResponseMsg}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleRespond('rejected')}
                disabled={responding}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleRespond('accepted')}
                disabled={responding}
              >
                {responding ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.acceptText}>Accept Inquiry</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedInquiry(null)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 10,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  advertiserInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38BDF8',
    marginBottom: 6,
  },
  dateRangeText: {
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  messageBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: 13,
    marginBottom: 8,
  },
  responseBox: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    padding: 10,
    color: '#93C5FD',
    fontSize: 13,
    marginTop: 4,
  },
  respondBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  respondBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#7F1D1D',
    marginRight: 8,
  },
  acceptBtn: {
    backgroundColor: '#064E3B',
    marginLeft: 8,
  },
  rejectText: {
    color: '#FCA5A5',
    fontWeight: '800',
  },
  acceptText: {
    color: '#34D399',
    fontWeight: '800',
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
});
