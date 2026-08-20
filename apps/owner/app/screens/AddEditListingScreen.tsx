import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { BANNER_TYPES, ILLUMINATION_OPTIONS, POPULAR_CITIES, Banner } from '@adspace/shared';
import { api } from '../services/authStorage';

interface Props {
  navigation: any;
  route: any;
}

export const AddEditListingScreen: React.FC<Props> = ({ navigation, route }) => {
  const existingBanner: Banner | null = route.params?.banner || null;

  const [title, setTitle] = useState(existingBanner?.title || '');
  const [type, setType] = useState(existingBanner?.type || 'hoarding');
  const [description, setDescription] = useState(existingBanner?.description || '');
  const [width, setWidth] = useState(existingBanner?.dimensions?.width?.toString() || '40');
  const [height, setHeight] = useState(existingBanner?.dimensions?.height?.toString() || '20');
  const [unit, setUnit] = useState<'ft' | 'm'>(existingBanner?.dimensions?.unit || 'ft');
  const [illumination, setIllumination] = useState<'lit' | 'non_lit'>(existingBanner?.illumination || 'lit');
  const [trafficNotes, setTrafficNotes] = useState(existingBanner?.trafficNotes || '');
  const [priceAmount, setPriceAmount] = useState(existingBanner?.price?.amount?.toString() || '75000');
  const [pricePer, setPricePer] = useState<'day' | 'week' | 'month'>(existingBanner?.price?.per || 'month');

  // Location fields
  const [address, setAddress] = useState(existingBanner?.location?.address || 'Baner Main Road, near High Street');
  const [city, setCity] = useState(existingBanner?.location?.city || 'Pune');
  const [state, setState] = useState(existingBanner?.location?.state || 'Maharashtra');
  const [landmark, setLandmark] = useState(existingBanner?.location?.landmark || 'Opposite Capital Building');
  const [lng, setLng] = useState(existingBanner?.location?.coordinates[0]?.toString() || '73.7868');
  const [lat, setLat] = useState(existingBanner?.location?.coordinates[1]?.toString() || '18.5590');

  // Photos
  const [photos, setPhotos] = useState<Array<{ url: string; isPrimary: boolean }>>(
    existingBanner?.photos || [
      { url: 'https://picsum.photos/800/600?random=1', isPrimary: true },
      { url: 'https://picsum.photos/800/600?random=2', isPrimary: false },
    ]
  );

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickLocationCurrentGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLat(loc.coords.latitude.toFixed(6));
      setLng(loc.coords.longitude.toFixed(6));

      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        if (place.city) setCity(place.city);
        if (place.region) setState(place.region);
        if (place.street || place.name) {
          setAddress(`${place.street || ''} ${place.name || ''}`.trim());
        }
      }
    } catch (err) {
      Alert.alert('Location Error', 'Unable to fetch current GPS coordinates.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadingPhoto(true);

        // Fetch presigned upload URL from API
        const filename = asset.uri.split('/').pop() || 'photo.jpg';
        const presignRes = await api.getPresignedUploadUrl(filename, 'image/jpeg');

        if (presignRes.success && presignRes.data) {
          const newPhotoUrl = presignRes.data.finalUrl;
          setPhotos((prev) => [
            ...prev,
            { url: newPhotoUrl, isPrimary: prev.length === 0 },
          ]);
        }
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not process photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!title || !priceAmount || !address || !city) {
      Alert.alert('Missing Fields', 'Title, price, address and city are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        type,
        description,
        dimensions: {
          width: parseFloat(width) || 40,
          height: parseFloat(height) || 20,
          unit,
        },
        illumination,
        trafficNotes,
        price: {
          amount: parseFloat(priceAmount) || 50000,
          currency: 'INR' as const,
          per: pricePer,
        },
        location: {
          type: 'Point' as const,
          coordinates: [parseFloat(lng) || 73.7868, parseFloat(lat) || 18.559] as [number, number],
          address,
          city,
          state,
          landmark,
        },
        photos: photos.length > 0 ? photos : [{ url: 'https://picsum.photos/800/600', isPrimary: true }],
      };

      if (existingBanner) {
        await api.updateBanner(existingBanner.id || existingBanner._id, payload);
      } else {
        await api.createBanner(payload);
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Failed to save banner listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeader}>Basic Details</Text>

      <Text style={styles.label}>Listing Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Baner Road Flyover Gantry — Facing City"
        placeholderTextColor="#64748B"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Space Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {BANNER_TYPES.map((bt) => (
          <TouchableOpacity
            key={bt.value}
            style={[styles.chip, type === bt.value && styles.activeChip]}
            onPress={() => setType(bt.value as any)}
          >
            <Text style={[styles.chipText, type === bt.value && styles.activeChipText]}>
              {bt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Illumination</Text>
      <View style={styles.row}>
        {ILLUMINATION_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.toggleBtn, illumination === opt.value && styles.activeToggleBtn]}
            onPress={() => setIllumination(opt.value as any)}
          >
            <Text style={[styles.toggleBtnText, illumination === opt.value && styles.activeToggleBtnText]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionHeader}>Dimensions & Pricing</Text>

      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Width ({unit})</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={width}
            onChangeText={setWidth}
          />
        </View>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Height ({unit})</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Price (INR) *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={priceAmount}
            onChangeText={setPriceAmount}
          />
        </View>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Per Period</Text>
          <View style={styles.periodRow}>
            {(['day', 'week', 'month'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.miniChip, pricePer === p && styles.activeMiniChip]}
                onPress={() => setPricePer(p)}
              >
                <Text style={[styles.miniChipText, pricePer === p && styles.activeMiniChipText]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>GPS Location & Address</Text>

      <TouchableOpacity style={styles.gpsBtn} onPress={pickLocationCurrentGPS}>
        <Text style={styles.gpsBtnText}>📍 Use Current Device GPS Location</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Address / Street *</Text>
      <TextInput
        style={styles.input}
        placeholder="Baner Main Road, Near High Street"
        placeholderTextColor="#64748B"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>City *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {POPULAR_CITIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, city === c && styles.activeChip]}
            onPress={() => setCity(c)}
          >
            <Text style={[styles.chipText, city === c && styles.activeChipText]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={lat} onChangeText={setLat} />
        </View>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={lng} onChangeText={setLng} />
        </View>
      </View>

      <Text style={styles.sectionHeader}>Photos ({photos.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
        {photos.map((p, idx) => (
          <View key={idx} style={styles.photoContainer}>
            <Image source={{ uri: p.url }} style={styles.photoThumb} />
          </View>
        ))}
        <TouchableOpacity style={styles.addPhotoBox} onPress={pickImage} disabled={uploadingPhoto}>
          {uploadingPhoto ? (
            <ActivityIndicator color="#38BDF8" />
          ) : (
            <>
              <Text style={styles.addPhotoIcon}>📷</Text>
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Text style={styles.label}>Traffic & Visibility Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={3}
        placeholder="e.g. High visibility to peak-hour IT park traffic..."
        placeholderTextColor="#64748B"
        value={trafficNotes}
        onChangeText={setTrafficNotes}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveBtnText}>
            {existingBanner ? 'Update Banner Listing' : 'Publish Banner Space'}
          </Text>
        )}
      </TouchableOpacity>
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38BDF8',
    marginTop: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeChip: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCol: {
    width: '48%',
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeToggleBtn: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  toggleBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeToggleBtnText: {
    color: '#FFFFFF',
  },
  periodRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  miniChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeMiniChip: {
    backgroundColor: '#0284C7',
  },
  miniChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeMiniChipText: {
    color: '#FFFFFF',
  },
  gpsBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  gpsBtnText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  photoRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  photoContainer: {
    marginRight: 10,
  },
  photoThumb: {
    width: 100,
    height: 80,
    borderRadius: 10,
  },
  addPhotoBox: {
    width: 100,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: {
    fontSize: 24,
  },
  addPhotoText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
