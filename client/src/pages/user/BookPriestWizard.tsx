import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  CreditCard,
  Info,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import AvailabilityCalendar from '../../components/shared/AvailabilityCalendar';
import { usePriests } from '../../hooks/usePriests';
import { useBookings } from '../../hooks/useBookings';
import { paymentApi } from '../../api/services/payment.service';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const steps = [
  { id: 1, title: 'Ceremony', icon: Info },
  { id: 2, title: 'Slot', icon: Calendar },
  { id: 3, title: 'Venue', icon: MapPin },
  { id: 4, title: 'Review', icon: CheckCircle2 },
  { id: 5, title: 'Payment', icon: CreditCard },
];

interface PriestService {
  name: string;
  durationHours: number;
  basePriceINR: number;
  description?: string;
}

interface Priest {
  id: string;
  user: {
    name: { first: string; last: string };
    email: string;
  };
  services: PriestService[];
}

const BookPriestWizard: React.FC = () => {
  const { id: priestId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPriestById, getAvailability } = usePriests();
  const { createBooking, loading: bookingLoading } = useBookings();

  const [currentStep, setCurrentStep] = useState(1);
  const [priest, setPriest] = useState<Priest | null>(null);

  const [bookingData, setBookingData] = useState({
    ceremony: {
      name: '',
      duration: 0,
    },
    date: new Date(),
    timeSlot: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    specialRequests: '',
  });

  useEffect(() => {
    if (priestId) {
      getPriestById(priestId).then((data) => {
        setPriest(data as unknown as Priest);
      });
    }
  }, [priestId]);

  useEffect(() => {
    if (priestId && currentStep === 2) {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 30);
      getAvailability(priestId, from.toISOString(), to.toISOString());
    }
  }, [priestId, currentStep]);

  const nextStep = (): void => {
    if (currentStep === 1 && !bookingData.ceremony.name) {
      toast.warning('Please select a ceremony');
      return;
    }
    if (currentStep === 2 && !bookingData.timeSlot) {
      toast.warning('Please select a time slot');
      return;
    }
    if (currentStep === 3 && (!bookingData.address.street || !bookingData.address.city)) {
      toast.warning('Please fill in venue details');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePayment = async (): Promise<void> => {
    try {
      // 1. Create booking first
      const payload = {
        priestId,
        ceremony: bookingData.ceremony,
        scheduledDate: bookingData.date.toISOString(),
        scheduledTime: bookingData.timeSlot,
        venue: {
          ...bookingData.address,
        },
        specialRequests: bookingData.specialRequests,
      };

      const booking = (await createBooking(payload)) as unknown as { id: string };
      if (!booking) return;

      // 2. Create Razorpay order
      const { data: orderResponse } = (await paymentApi.createOrder({
        bookingId: booking.id,
      })) as unknown as { data: { data: { id: string; amount: number; currency: string } } };
      const order = orderResponse.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Guruji Priest Booking',
        description: `Booking for ${bookingData.ceremony.name}`,
        order_id: order.id,
        handler: async (response: Record<string, string>): Promise<void> => {
          try {
            await paymentApi.verifyPayment({
              bookingId: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Your booking is confirmed.');
            navigate('/dashboard');
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${user?.name.first} ${user?.name.last}`,
          email: user?.email,
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = new (
        window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }
      ).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Payment initiation failed');
    }
  };

  const prevStep = (): void => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = (): React.JSX.Element | null => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold">Select Ceremony</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {priest?.services?.map((service: PriestService) => (
                <div
                  key={service.name}
                  onClick={() =>
                    setBookingData({
                      ...bookingData,
                      ceremony: { name: service.name, duration: service.durationHours },
                    })
                  }
                  className={cn(
                    'p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300',
                    bookingData.ceremony.name === service.name
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  )}
                >
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">₹{service.basePriceINR}</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold">Select Date & Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AvailabilityCalendar
                onDateSelect={(date) => setBookingData({ ...bookingData, date })}
              />
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700">Available Slots</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setBookingData({ ...bookingData, timeSlot: time })}
                      className={cn(
                        'py-3 rounded-xl border text-sm font-semibold transition-all',
                        bookingData.timeSlot === time
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                          : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold">Venue Details</h2>
            <div className="card p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Street Address
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="H.No, Street, Locality"
                  value={bookingData.address.street}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      address: { ...bookingData.address, street: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">City</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="City"
                    value={bookingData.address.city}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        address: { ...bookingData.address, city: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Pincode</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Pincode"
                    value={bookingData.address.pincode}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        address: { ...bookingData.address, pincode: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Special Requests
                </label>
                <textarea
                  className="input-field h-24"
                  placeholder="Any specific requirements..."
                  value={bookingData.specialRequests}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, specialRequests: e.target.value })
                  }
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold">Review Booking</h2>
            <div className="card overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {bookingData.ceremony.name || 'Selected Ceremony'}
                    </h3>
                    <p className="text-slate-500">
                      Booking with {priest?.user?.name?.first} {priest?.user?.name?.last}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block uppercase font-bold">
                      Base Price
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₹
                      {(
                        (priest?.services as Array<{ name: string; basePriceINR: number }>) || []
                      ).find((s) => s.name === bookingData.ceremony.name)?.basePriceINR || 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-slate-600">
                  <Calendar size={18} className="text-indigo-500" />
                  <span>
                    {bookingData.date.toDateString()} at {bookingData.timeSlot || 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-600">
                  <MapPin size={18} className="text-indigo-500" />
                  <span>{bookingData.address.street || 'Venue address not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 5: {
        const selectedService = (
          (priest?.services as Array<{ name: string; basePriceINR: number }>) || []
        ).find((s) => s.name === bookingData.ceremony.name);
        const advanceAmount = selectedService ? Math.round(selectedService.basePriceINR * 0.3) : 0;

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-10">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard size={40} />
            </div>
            <h2 className="text-2xl font-bold">Complete Payment</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Please pay the advance amount of{' '}
              <span className="font-bold text-slate-900">₹{advanceAmount}</span> to confirm your
              booking.
            </p>
            <button
              onClick={handlePayment}
              disabled={bookingLoading}
              className="btn-primary mt-8 px-12 py-4 text-lg flex items-center gap-2 mx-auto"
            >
              {bookingLoading ? 'Processing...' : 'Pay with Razorpay'}
            </button>
            <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
              Secure Payment Gateway
            </p>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-12 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 -z-10"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                  currentStep >= step.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white border-2 border-slate-100 text-slate-400'
                )}
              >
                <Icon size={18} />
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-widest',
                  currentStep >= step.id ? 'text-indigo-600' : 'text-slate-400'
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Navigation Buttons */}
      <div className="mt-12 flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        {currentStep < 5 ? (
          <button onClick={nextStep} className="btn-primary flex items-center gap-2">
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <div className="w-24"></div>
        )}
      </div>
    </div>
  );
};

export default BookPriestWizard;
