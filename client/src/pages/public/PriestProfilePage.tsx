import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePriests } from '../../hooks/usePriests';
import { IPriestProfile } from '../../types/priest';
import { Star, MapPin, Award, Calendar, ShieldCheck } from 'lucide-react';

const PriestProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPriestById, loading } = usePriests();
  const [priest, setPriest] = useState<IPriestProfile | null>(null);

  useEffect(() => {
    if (id) {
      getPriestById(id).then((data) => setPriest(data as unknown as IPriestProfile));
    }
  }, [id]);

  if (loading || !priest) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-4xl font-bold shrink-0">
              {priest.user.name.first[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {priest.user.name.first} {priest.user.name.last}
                </h1>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold uppercase">
                  <ShieldCheck size={14} /> Verified
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-slate-500 mb-6">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-700">{priest.rating.average}</span>
                  <span>({priest.rating.count} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>
                    {priest.user.address.city}, {priest.user.address.state}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Award size={16} />
                  <span>{priest.experienceYears} Years Exp.</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-bold text-lg text-slate-900">About</h2>
                <p className="text-slate-600 leading-relaxed">{priest.bio}</p>
              </div>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6">Ceremonies & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priest.services.map((service) => (
                <div
                  key={service.name}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">{service.name}</h3>
                    <span className="text-indigo-600 font-bold">₹{service.basePriceINR}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{service.description}</p>
                  <div className="text-xs text-slate-400">
                    Duration: {service.durationHours} Hours
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Action */}
        <div className="space-y-6">
          <div className="card p-6 sticky top-24">
            <div className="mb-6">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-widest block mb-1">
                Price starting from
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  ₹
                  {Math.min(
                    ...((priest.services as Array<{ basePriceINR: number }>) || []).map(
                      (s) => s.basePriceINR
                    )
                  )}
                </span>
                <span className="text-slate-400">/ ceremony</span>
              </div>
            </div>

            <Link
              to={`/book/${priest.id}`}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              Book Now
            </Link>

            <p className="text-[10px] text-slate-400 text-center mt-4 uppercase font-bold tracking-tighter">
              100% Secure • Refund Guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriestProfilePage;
