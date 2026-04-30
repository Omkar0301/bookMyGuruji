import { CeremonyType } from '../types/enums';

const SearchPage: React.FC = () => {
  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 space-y-6">
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Filters</h2>
          {/* Filter content */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500 block mb-2">Price Range</label>
              <input type="range" className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 block mb-2">Ceremony</label>
              {Object.values(CeremonyType).map((type) => (
                <div key={type} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id={type} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Priest cards would go here */}
          <div className="card p-4 animate-pulse">
            <div className="w-full h-48 bg-slate-100 rounded-xl mb-4"></div>
            <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
