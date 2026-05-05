import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CeremonyType } from '../../types/enums';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [ceremony, setCeremony] = useState('');

  const handleSearch = (): void => {
    const params = new URLSearchParams();
    if (city) params.append('location', city);
    if (ceremony) params.append('ceremonyType', ceremony);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto">
      <div className="text-center py-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
          Find Your Perfect <span className="text-indigo-600">Guruji</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Book certified priests for any ceremony, anywhere. Transparent pricing, verified profiles,
          and seamless booking.
        </p>

        <div className="glass p-4 rounded-3xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by city..."
            className="input-field flex-1"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <select
            className="input-field flex-1"
            value={ceremony}
            onChange={(e) => setCeremony(e.target.value)}
          >
            <option value="">Select Ceremony Type</option>
            {Object.values(CeremonyType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button onClick={handleSearch} className="btn-primary whitespace-nowrap">
            Find Priest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
