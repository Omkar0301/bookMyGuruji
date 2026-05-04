import React from 'react';
import { Link } from 'react-router-dom';
import { CeremonyType } from '../types/enums';
import { Sparkles } from 'lucide-react';

const CeremoniesPage: React.FC = () => {
  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Services</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          We provide a wide range of religious services and ceremonies performed by certified and
          experienced priests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.values(CeremonyType).map((type) => (
          <Link
            key={type}
            to={`/search?ceremonyType=${type}`}
            className="card p-8 hover:border-indigo-600 group transition-all"
          >
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{type}</h3>
            <p className="text-slate-500 text-sm mb-6">
              Expert priests available for {type.toLowerCase()} ceremonies with proper vedic
              rituals.
            </p>
            <span className="text-indigo-600 font-bold text-sm group-hover:translate-x-2 inline-block transition-transform">
              Find Priests &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CeremoniesPage;
