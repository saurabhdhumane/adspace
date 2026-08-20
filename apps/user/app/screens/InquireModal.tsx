import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/authStorage';

interface Props {
  visible: boolean;
  bannerId: string;
  onClose: () => void;
}

export const InquireModal: React.FC<Props> = ({ visible, bannerId, onClose }) => {
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-30');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      Alert.alert('Missing Dates', 'Please specify both start and end dates.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createInquiry({
        bannerId,
        requestedRange: { from: fromDate, to: toDate },
        message,
      });

      Alert.alert('Inquiry Sent!', 'The space owner has been notified and will respond shortly.');
      onClose();
    } catch (err: any) {
      Alert.alert('Inquiry Failed', err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Request Banner Booking</Text>
          <Text style={styles.modalSubtitle}>
            Submit your proposed campaign dates to the space owner.
          </Text>

          <Text style={styles.label}>Campaign Start Date (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            value={fromDate}
            onChangeText={setFromDate}
            placeholder="2026-09-01"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Campaign End Date (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            value={toDate}
            onChangeText={setToDate}
            placeholder="2026-09-30"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.label}>Campaign Message / Requirements</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            value={message}
            onChangeText={setMessage}
            placeholder="e.g. We want to run a brand awareness campaign for our new EV launch..."
            placeholderTextColor="#64748B"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.submitBtn]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>Submit Inquiry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 10,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#334155',
    marginRight: 8,
  },
  submitBtn: {
    backgroundColor: '#059669',
    marginLeft: 8,
  },
  cancelText: {
    color: '#CBD5E1',
    fontWeight: '700',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
