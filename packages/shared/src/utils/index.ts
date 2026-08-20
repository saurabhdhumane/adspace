import { Banner, BookedSlot } from '../types/index.js';

export const formatPrice = (amount: number, currency = 'INR', per = 'month'): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted}/${per}`;
};

export const computeBannerStatus = (bookedSlots: BookedSlot[] = []): 'available' | 'busy' => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isBusy = bookedSlots.some((slot) => {
    const fromDate = new Date(slot.from);
    const toDate = new Date(slot.to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    return today >= fromDate && today <= toDate;
  });

  return isBusy ? 'busy' : 'available';
};

export const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
