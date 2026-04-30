import React, { useState } from 'react';
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

const steps = [
  { id: 1, title: 'Ceremony', icon: Info },
  { id: 2, title: 'Slot', icon: Calendar },
  { id: 3, title: 'Venue', icon: MapPin },
  { id: 4, title: 'Review', icon: CheckCircle2 },
  { id: 5, title: 'Payment', icon: CreditCard },
];

const BookPriestWizard: React.FC = () => {
  useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    ceremonyId: '',
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

  const nextStep = (): void => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = (): void => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = (): React.JSX.Element | null => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold">Select Ceremony</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Wedding Puja', 'Griha Pravesh', 'Satyanarayan Katha', 'Engagement'].map(
                (ceremony) => (
                  <div
                    key={ceremony}
                    onClick={() => setBookingData({ ...bookingData, ceremonyId: ceremony })}
                    className={cn(
                      'p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300',
                      bookingData.ceremonyId === ceremony
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    )}
                  >
                    <h3 className="font-bold text-lg">{ceremony}</h3>
                    <p className="text-sm text-slate-500 mt-1">Starting from ₹5,100</p>
                  </div>
                )
              )}
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
                  <input type="text" className="input-field" placeholder="City" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Pincode</label>
                  <input type="text" className="input-field" placeholder="Pincode" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Special Requests
                </label>
                <textarea
                  className="input-field h-24"
                  placeholder="Any specific requirements..."
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
                      {bookingData.ceremonyId || 'Selected Ceremony'}
                    </h3>
                    <p className="text-slate-500">Booking with Panditji Sharma</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block uppercase font-bold">
                      Total Price
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">₹5,100</span>
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
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-10">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard size={40} />
            </div>
            <h2 className="text-2xl font-bold">Complete Payment</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Please pay the advance amount of{' '}
              <span className="font-bold text-slate-900">₹1,100</span> to confirm your booking.
            </p>
            <button className="btn-primary mt-8 px-12 py-4 text-lg">Pay with Razorpay</button>
            <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
              Secure Payment Gateway
            </p>
          </div>
        );
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
