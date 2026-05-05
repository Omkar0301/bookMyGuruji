import React, { useEffect, useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import StatusBadge from '../../components/shared/StatusBadge';
import { BookingStatus } from '../../types/enums';
import { IBooking } from '../../types/booking';
import { Calendar as CalendarIcon, MapPin, User, ChevronRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const PriestBookings: React.FC = () => {
  const { bookings, loading, fetchMyBookings, updateBookingStatus } = useBookings();
  const [filter, setFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => (filter === 'all' ? true : b.status === filter));

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Bookings</h1>
          <p className="text-slate-500">Manage all your ceremony requests and confirmed events</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              )}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="card p-0 overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {booking.bookingNumber}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{booking.ceremony.name}</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      {booking.user.name.first} {booking.user.name.last}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon size={14} />
                      {new Date(booking.scheduledDate).toLocaleDateString()} at{' '}
                      {booking.scheduledTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {booking.venue.city}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Payout</span>
                    <span className="text-lg font-bold text-slate-900">
                      ₹{booking.pricing.totalAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === BookingStatus.PENDING && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirm')}
                          className="btn-primary py-2 px-4 text-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'decline', 'Unavailable')}
                          className="btn-secondary py-2 px-4 text-xs text-rose-600 border-rose-100 hover:bg-rose-50"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {booking.status === BookingStatus.CONFIRMED && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'complete')}
                        className="btn-primary py-2 px-4 text-xs bg-emerald-500 hover:bg-emerald-600 border-none"
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailModal(true);
                      }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 italic">No bookings found for the selected filter.</p>
          </div>
        )}
      </div>

      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl p-0 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {selectedBooking.bookingNumber}
                </span>
                <h3 className="text-2xl font-bold">{selectedBooking.ceremony.name}</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">
                    Customer Details
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {selectedBooking.user.name.first[0]}
                      {selectedBooking.user.name.last[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {selectedBooking.user.name.first} {selectedBooking.user.name.last}
                      </p>
                      <p className="text-sm text-slate-500">{selectedBooking.user.phone}</p>
                      <p className="text-sm text-slate-500">{selectedBooking.user.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">
                    Schedule & Venue
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon size={16} className="text-indigo-600" />
                      <span className="font-medium">
                        {new Date(selectedBooking.scheduledDate).toLocaleDateString()} at{' '}
                        {selectedBooking.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={16} className="text-indigo-600 mt-1" />
                      <span className="text-slate-600 leading-tight">
                        {selectedBooking.venue.address},<br />
                        {selectedBooking.venue.city}, {selectedBooking.venue.state} -{' '}
                        {selectedBooking.venue.pincode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">
                  Pricing Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Base Fee</span>
                    <span className="font-medium text-slate-900">
                      ₹{selectedBooking.pricing.basePrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Materials & Items</span>
                    <span className="font-medium text-slate-900">
                      ₹{selectedBooking.pricing.materialsPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Travel Fee</span>
                    <span className="font-medium text-slate-900">
                      ₹{selectedBooking.pricing.travelFee}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-base">Your Payout</span>
                    <span className="font-black text-indigo-600 text-xl">
                      ₹{selectedBooking.pricing.priestEarnings}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.status === BookingStatus.PENDING && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'confirm');
                      setShowDetailModal(false);
                    }}
                    className="flex-1 btn-primary py-4"
                  >
                    Accept Booking Request
                  </button>
                  <button
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, 'decline', 'Unavailable');
                      setShowDetailModal(false);
                    }}
                    className="flex-1 btn-secondary text-rose-600 border-rose-100 hover:bg-rose-50"
                  >
                    Decline Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriestBookings;
