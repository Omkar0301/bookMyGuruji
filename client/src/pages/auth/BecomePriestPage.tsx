import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CeremonyType } from '../types/enums';
import { toast } from 'react-toastify';
import { Plus, Trash2 } from 'lucide-react';

const BecomePriestPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    specialisations: [] as string[],
    experienceYears: 0,
    languages: [] as string[],
    services: [{ name: '', basePriceINR: 0, durationHours: 0, description: '' }],
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Final registration call
    const result = await register(
      {
        name: { first: formData.firstName, last: formData.lastName },
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        bio: formData.bio,
        specialisations: formData.specialisations,
        experienceYears: formData.experienceYears,
        languages: formData.languages,
        services: formData.services.filter((s) => s.name),
        address: formData.address,
      },
      true
    );

    if (!result.success) {
      toast.error(result.message || 'Registration failed');
    } else {
      toast.success('Priest profile submitted for verification!');
    }
  };

  const handleServiceChange = (index: number, field: string, value: string | number): void => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData({ ...formData, services: newServices });
  };

  const addService = (): void => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        { name: '', basePriceINR: 0, durationHours: 0, description: '' },
      ],
    });
  };

  const removeService = (index: number): void => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  const toggleSpecialisation = (spec: string): void => {
    const newSpecs = formData.specialisations.includes(spec)
      ? formData.specialisations.filter((s) => s !== spec)
      : [...formData.specialisations, spec];
    setFormData({ ...formData, specialisations: newSpecs });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Join as a Priest</h1>
        <p className="text-slate-500">
          Provide your professional details to reach thousands of devotees
        </p>
      </div>

      <div className="card p-8">
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white border-2 border-slate-100 text-slate-400'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setStep(2)} className="btn-primary px-8">
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Professional Details</h2>
              <div>
                <label className="label">Specialisations</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(CeremonyType).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleSpecialisation(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.specialisations.includes(type)
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Experience (Years)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceYears: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input-field h-32"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell devotees about your lineage, education, and style of performing rituals..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary px-8">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary px-8">
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Services & Pricing</h2>
                <button
                  type="button"
                  onClick={addService}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline"
                >
                  <Plus size={16} /> Add Service
                </button>
              </div>

              {formData.services.map((service, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group"
                >
                  {formData.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      <textarea
                        className="input-field h-20"
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                        placeholder="What's included in this service?"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between mt-10">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary px-8">
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary px-12">
                  {isLoading ? 'Submitting...' : 'Register as Priest'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <p className="mt-8 text-center text-slate-500 text-sm">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default BecomePriestPage;
