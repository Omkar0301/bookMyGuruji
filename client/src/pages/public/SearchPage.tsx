import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CeremonyType } from '../types/enums';
import { usePriests } from '../hooks/usePriests';
import PriestCard from '../components/shared/PriestCard';

const SearchPage: React.FC = () => {
  const { searchResults, loading, searchPriests, filters, setFilters, pagination } = usePriests();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilters: Record<string, string> = {};
    if (params.get('location')) initialFilters.location = params.get('location');
    if (params.get('ceremonyType')) initialFilters.ceremonyType = params.get('ceremonyType');

    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }

    searchPriests(initialFilters);
  }, [location.search, pagination.page]);

  const handleCeremonyToggle = (type: string): void => {
    // Basic filter implementation
    setFilters({ ceremonyType: type });
  };

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 space-y-6">
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500 block mb-2">Ceremony</label>
              {Object.values(CeremonyType).map((type) => (
                <div key={type} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id={type}
                    checked={filters.ceremonyType === type}
                    onChange={() => handleCeremonyToggle(type)}
                  />
                  <label htmlFor={type} className="text-sm">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Priests in your area</h1>
          <select className="px-3 py-2 border rounded-lg text-sm bg-white">
            <option>Sort by: Recommended</option>
            <option>Price: Low to High</option>
            <option>Rating: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="w-full h-48 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((priest) => (
              <PriestCard
                key={priest.id}
                id={priest.id}
                name={`${priest.user.name.first} ${priest.user.name.last}`}
                avatar={priest.user.avatar}
                rating={priest.rating.average}
                specialisations={priest.specialisations}
                priceRange={{
                  min:
                    priest.services.length > 0
                      ? Math.min(
                          ...priest.services.map((s: { basePriceINR: number }) => s.basePriceINR)
                        )
                      : 0,
                  max:
                    priest.services.length > 0
                      ? Math.max(
                          ...priest.services.map((s: { basePriceINR: number }) => s.basePriceINR)
                        )
                      : 0,
                }}
                city={priest.user.address.city}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400">No priests found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
