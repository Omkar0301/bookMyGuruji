import React from 'react';
import { Star, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PriestCardProps {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  specialisations: string[];
  priceRange: { min: number; max: number };
  city: string;
}

const PriestCard: React.FC<PriestCardProps> = ({
  id,
  name,
  avatar,
  rating,
  specialisations,
  priceRange,
  city,
}) => {
  return (
    <div className="card group overflow-hidden flex flex-col">
      <div className="relative h-56 overflow-hidden bg-slate-200">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Award size={48} strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-4 right-4 glass px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-slate-800">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
          <MapPin size={14} />
          {city}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {specialisations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-medium uppercase tracking-wider border border-slate-100"
            >
              {spec}
            </span>
          ))}
          {specialisations.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{specialisations.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Starting from</span>
            <span className="text-lg font-bold text-indigo-600">₹{priceRange.min}</span>
          </div>

          <Link to={`/priests/${id}`} className="btn-primary py-2 px-4 text-sm">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PriestCard;
