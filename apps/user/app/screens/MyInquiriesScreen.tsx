import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Inquiry } from '@adspace/shared';
import { api } from '../services/authStorage';

interface Props {
  navigation: any;
}

export const MyInquiriesScreen: React.FC<Props> = ({ navigation }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sent-inquiries'],
    queryFn: async () => {
      const res = await api.getSentInquiries();
      return res.data || [];
    },
  });

  const renderItem = ({ item }: { item: Inquiry }) => {
    const banner = typeof item.bannerId === 'object' ? item.bannerId : null;
    const owner = typeof item.ownerId === 'object' ? item.ownerId : null;

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

        <Text style={styles.ownerText}>
          🏢 Owner: {owner?.name || 'Publisher'} {owner?.company ? `(${owner.company})` : ''}
        </Text>

        <Text style={styles.dateText}>
          📅 Campaign Range: {new Date(item.requestedRange.from).toLocaleDateString()} —{' '}
          {new Date(item.requestedRange.to).toLocaleDateString()}
        </Text>

        {item.message ? <Text style={styles.msgBox}>Your Note: "{item.message}"</Text> : null}

        {item.ownerResponse ? (
          <View style={styles.responseBox}>
            <Text style={styles.responseLabel}>Owner Response:</Text>
            <Text style={styles.responseText}>"{item.ownerResponse}"</Text>
          </View>
        ) : null}

        {banner ? (
          <TouchableOpacity
            style={styles.viewBannerBtn}
            onPress={() =>
              navigation.navigate('BannerDetail', { bannerId: banner.id || (banner as any)._id })
            }
          >
            <Text style={styles.viewBannerText}>View Space Details →</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Sent Inquiries</Text>
        <Text style={styles.headerSubtitle}>Track your space booking proposals & owner responses</Text>
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
              <Text style={styles.emptyTitle}>No Inquiries Sent</Text>
              <Text style={styles.emptyText}>When you submit proposals for banner spaces, they will show up here.</Text>
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
  ownerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34D399',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  msgBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
    fontSize: 13,
    marginBottom: 8,
  },
  responseBox: {
    backgroundColor: '#064E3B',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  responseLabel: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  responseText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  viewBannerBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  viewBannerText: {
    color: '#34D399',
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
    lineHeight: 20,
  },
});
