import React, { useEffect, useState } from 'react';
import { usePriests } from '../../hooks/usePriests';
import { IPriestProfile, IService } from '../../types/priest';
import { CeremonyType } from '../../types/enums';
import { Save, Plus, Trash2, User, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

const PriestProfile: React.FC = () => {
  const { getMyProfile, updateProfile, updateServices, loading } = usePriests();
  const [profile, setProfile] = useState<IPriestProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'services'>('general');

  useEffect(() => {
    getMyProfile().then(setProfile);
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!profile) return;
    await updateProfile(profile);
  };

  const handleServicesUpdate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!profile) return;
    await updateServices(profile.services);
  };

  const addService = (): void => {
    if (!profile) return;
    setProfile({
      ...profile,
      services: [
        ...profile.services,
        { name: '', description: '', basePriceINR: 0, durationHours: 1, includesMaterials: false },
      ],
    });
  };

  const removeService = (index: number): void => {
    if (!profile) return;
    const newServices = profile.services.filter((_, i) => i !== index);
    setProfile({ ...profile, services: newServices });
  };

  const handleServiceChange = (
    index: number,
    field: keyof IService,
    value: IService[keyof IService]
  ): void => {
    if (!profile) return;
    const newServices = [...profile.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setProfile({ ...profile, services: newServices });
  };

  const toggleSpecialisation = (spec: string): void => {
    if (!profile) return;
    const newSpecs = profile.specialisations.includes(spec)
      ? profile.specialisations.filter((s) => s !== spec)
      : [...profile.specialisations, spec];
    setProfile({ ...profile, specialisations: newSpecs });
  };

  if (!profile && loading) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Profile</h1>
          <p className="text-slate-500">Update your public details and service offerings</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              'px-6 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            )}
          >
            General Info
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={cn(
              'px-6 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === 'services' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            )}
          >
            Services & Pricing
          </button>
        </div>
      </div>

      {activeTab === 'general' ? (
        <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in duration-300">
          <div className="card p-8 space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
              <User size={20} />
              <span>Personal & Professional Info</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  disabled
                  className="input-field bg-slate-50 opacity-70 cursor-not-allowed"
                  value={profile.user.name.first}
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  disabled
                  className="input-field bg-slate-50 opacity-70 cursor-not-allowed"
                  value={profile.user.name.last}
                />
              </div>
            </div>

            <div>
              <label className="label">Professional Bio</label>
              <textarea
                className="input-field h-32"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Describe your background, experience, and style..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Experience (Years)</label>
                <input
                  type="number"
                  className="input-field"
                  value={profile.experienceYears}
                  onChange={(e) =>
                    setProfile({ ...profile, experienceYears: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Travel Radius (KM)</label>
                <input
                  type="number"
                  className="input-field"
                  value={profile.travelRadius}
                  onChange={(e) =>
                    setProfile({ ...profile, travelRadius: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <label className="label">Languages Spoken</label>
              <input
                type="text"
                className="input-field"
                placeholder="Comma separated: Hindi, Sanskrit, English..."
                value={profile.languages.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    languages: e.target.value.split(',').map((l) => l.trim()),
                  })
                }
              />
            </div>
          </div>

          <div className="card p-8">
            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-6">
              <BookOpen size={20} />
              <span>Specialisations</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(CeremonyType).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => toggleSpecialisation(type)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                    profile.specialisations.includes(type)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-10 flex items-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save General Info'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleServicesUpdate} className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Your Service Menu</h2>
            <button
              type="button"
              onClick={addService}
              className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline"
            >
              <Plus size={16} /> Add New Service
            </button>
          </div>

          {profile.services.map((service, index) => (
            <div key={index} className="card p-6 bg-slate-50 border-slate-100 relative group">
              <button
                type="button"
                onClick={() => removeService(index)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="label">Ceremony Name</label>
                  <select
                    className="input-field"
                    value={service.name}
                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                    required
                  >
                    <option value="">Select Ceremony</option>
                    {Object.values(CeremonyType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Base Price (INR)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={service.basePriceINR}
                    onChange={(e) =>
                      handleServiceChange(index, 'basePriceINR', parseInt(e.target.value))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Duration (Hours)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={service.durationHours}
                    onChange={(e) =>
                      handleServiceChange(index, 'durationHours', parseInt(e.target.value))
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Description</label>
                  <input
                    type="text"
                    className="input-field"
                    value={service.description}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    placeholder="Briefly explain what's included..."
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`materials-${index}`}
                  checked={service.includesMaterials}
                  onChange={(e) =>
                    handleServiceChange(index, 'includesMaterials', e.target.checked)
                  }
                />
                <label htmlFor={`materials-${index}`} className="text-sm text-slate-600">
                  Price includes necessary ritual materials (Samagri)
                </label>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-10 flex items-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Services & Pricing'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PriestProfile;
