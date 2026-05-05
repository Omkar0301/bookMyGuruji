import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../hooks/useAuth';
import { BookingStatus, UserRole, BookingAction } from '../../types/enums';
import StatusBadge from '../../components/shared/StatusBadge';
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  XCircle,
  CheckCircle2,
  ChevronLeft,
  MessageSquare,
  Info,
  CreditCard,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { IBooking } from '../../types/booking';

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { fetchBookingById, updateBookingStatus, loading } = useBookings();
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [showActionModal, setShowActionModal] = useState<{
    show: boolean;
    type: BookingAction | '';
  }>({ show: false, type: '' });
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchBookingById(id).then(setBooking);
    }
  }, [id]);

  const handleAction = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!id || !showActionModal.type) return;

    const action = showActionModal.type as BookingAction;
    const result = await updateBookingStatus(id, action, reason);
    if (result) {
      setBooking(result);
      setShowActionModal({ show: false, type: '' });
      setReason('');
    }
  };

  const performQuickAction = async (action: BookingAction): Promise<void> => {
    if (!id) return;
    const result = await updateBookingStatus(id, action);
    if (result) setBooking(result);
  };

  if (loading && !booking) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="pt-32 text-center">
        <p className="text-slate-500 italic">Booking not found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  const isPriest = currentUser?.role === UserRole.PRIEST;

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Bookings</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {booking.bookingNumber}
            </span>
            <StatusBadge status={booking.status} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{booking.ceremony.name}</h1>
        </div>

        <div className="flex gap-3">
          {isPriest && booking.status === BookingStatus.PENDING && (
            <>
              <button
                onClick={() => void performQuickAction(BookingAction.CONFIRM)}
                className="btn-primary py-2 px-6"
              >
                Accept
              </button>
              <button
                onClick={() => setShowActionModal({ show: true, type: BookingAction.DECLINE })}
                className="btn-secondary py-2 px-6 text-rose-600 border-rose-100 hover:bg-rose-50"
              >
                Decline
              </button>
            </>
          )}

          {isPriest && booking.status === BookingStatus.CONFIRMED && (
            <button
              onClick={() => void performQuickAction(BookingAction.COMPLETE)}
              className="btn-primary py-2 px-6 bg-emerald-600 hover:bg-emerald-700 border-none"
            >
              Mark Completed
            </button>
          )}

          {booking.status !== BookingStatus.CANCELLED &&
            booking.status !== BookingStatus.COMPLETED &&
            booking.status !== BookingStatus.DISPUTED && (
              <button
                onClick={() => setShowActionModal({ show: true, type: BookingAction.CANCEL })}
                className="btn-secondary py-2 px-6"
              >
                Cancel
              </button>
            )}

          {booking.status === BookingStatus.COMPLETED && (
            <button
              onClick={() => setShowActionModal({ show: true, type: BookingAction.DISPUTE })}
              className="btn-secondary py-2 px-6 text-orange-600 border-orange-100 hover:bg-orange-50"
            >
              Raise Dispute
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Details Card */}
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Info size={20} className="text-indigo-600" />
              Ceremony Details
            </h2>
            <div className="space-y-6">
              <p className="text-slate-600 leading-relaxed">{booking.ceremony.description}</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Date
                    </p>
                    <p className="font-bold">{new Date(booking.scheduledDate).toDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      Time
                    </p>
                    <p className="font-bold">{booking.scheduledTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Card */}
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-indigo-600" />
              Venue Information
            </h2>
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-900">{booking.venue.city}</p>
                <p className="text-slate-600 mt-1">
                  {booking.venue.address}, {booking.venue.state} - {booking.venue.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserIcon size={20} className="text-indigo-600" />
              {isPriest ? 'Customer Contact' : 'Priest Details'}
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl overflow-hidden">
                  {isPriest ? (
                    booking.user.avatar ? (
                      <img
                        src={booking.user.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      booking.user.name.first[0]
                    )
                  ) : booking.priest.user.avatar ? (
                    <img
                      src={booking.priest.user.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    booking.priest.user.name.first[0]
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {isPriest
                      ? `${booking.user.name.first} ${booking.user.name.last}`
                      : `${booking.priest.user.name.first} ${booking.priest.user.name.last}`}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {isPriest ? 'Customer' : 'Certified Priest'}
                  </p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href={`tel:${isPriest ? booking.user.phone : booking.priest.user.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <Phone size={18} className="text-indigo-600" />
                  <span className="text-sm font-medium">
                    {isPriest ? booking.user.phone : booking.priest.user.phone}
                  </span>
                </a>
                <a
                  href={`mailto:${isPriest ? booking.user.email : booking.priest.user.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <Mail size={18} className="text-indigo-600" />
                  <span className="text-sm font-medium">
                    {isPriest ? booking.user.email : booking.priest.user.email}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Payment Card */}
          <div className="card p-6 border-indigo-100 bg-indigo-50/30">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-600" />
              Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Base Amount</span>
                <span className="font-medium">₹{booking.pricing.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Materials</span>
                <span className="font-medium">₹{booking.pricing.materialsPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Travel Fee</span>
                <span className="font-medium">₹{booking.pricing.travelFee}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-indigo-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="text-xl font-black text-indigo-600">
                  ₹{booking.pricing.totalAmount}
                </span>
              </div>
              <div className="mt-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 size={14} />
                Payment Received
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              If you have any issues with this booking or need to contact support, reach out to our
              24/7 helpline.
            </p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={16} />
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal.show && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <XCircle size={32} />
              <h3 className="text-2xl font-bold">
                {showActionModal.type === BookingAction.CANCEL
                  ? 'Cancel Booking'
                  : showActionModal.type === BookingAction.DISPUTE
                    ? 'Raise Dispute'
                    : 'Decline Booking'}
              </h3>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Please provide a reason for this action. This will be shared with the other party.
            </p>
            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <label className="label">Reason</label>
                <textarea
                  className="input-field h-32"
                  placeholder="Explain why you are performing this action..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  minLength={10}
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowActionModal({ show: false, type: '' })}
                  className="flex-1 btn-secondary"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className={cn(
                    'flex-1 font-bold rounded-xl text-white transition-colors',
                    showActionModal.type === BookingAction.DISPUTE
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  )}
                >
                  {showActionModal.type === BookingAction.CANCEL
                    ? 'Cancel Booking'
                    : showActionModal.type === BookingAction.DISPUTE
                      ? 'Confirm Dispute'
                      : 'Decline Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
