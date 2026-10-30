import { useState, useEffect, useCallback } from 'react';
import { apiFetchBookings, apiFetchOwnerBookings, apiUpdateBookingStatus } from '../services/db';

/**
 * Custom hook to manage user and owner bookings
 */
export function useBookings(userId, { isOwner = false } = {}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = isOwner
        ? await apiFetchOwnerBookings(userId)
        : await apiFetchBookings(userId);

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error in useBookings:', err);
      setError('Failed to retrieve bookings.');
    } finally {
      setLoading(false);
    }
  }, [userId, isOwner]);

  useEffect(() => {
    fetchBookings();

    const handleCreated = () => fetchBookings();
    const handleUpdated = () => fetchBookings();
    window.addEventListener('turfington_booking_created', handleCreated);
    window.addEventListener('turfington_booking_updated', handleUpdated);

    return () => {
      window.removeEventListener('turfington_booking_created', handleCreated);
      window.removeEventListener('turfington_booking_updated', handleUpdated);
    };
  }, [fetchBookings]);

  const updateStatus = useCallback(async (bookingId, newStatus, reason = null) => {
    try {
      await apiUpdateBookingStatus(bookingId, newStatus, reason);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: newStatus, ...(reason ? { rejection_reason: reason } : {}) }
            : b
        )
      );
      return { success: true };
    } catch (err) {
      console.error('Failed to update booking status:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    refetchBookings: fetchBookings,
    updateStatus
  };
}

