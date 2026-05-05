import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CeremonyType } from '../../types/enums';
import { toast } from 'react-toastify';
import { Plus, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

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
    certificates: [{ name: '', fileUrl: '' }],
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

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
        certificates: formData.certificates.filter((c) => c.name && c.fileUrl),
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

  const handleCertificateChange = (index: number, field: string, value: string): void => {
    const newCerts = [...formData.certificates];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setFormData({ ...formData, certificates: newCerts });
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

  const addCertificate = (): void => {
    setFormData({
      ...formData,
      certificates: [...formData.certificates, { name: '', fileUrl: '' }],
    });
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
        <div className="flex justify-between mb-12 relative px-10">
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-100 -z-10"></div>
          {[
            { s: 1, l: 'Basic' },
            { s: 2, l: 'Profile' },
            { s: 3, l: 'Services' },
            { s: 4, l: 'Documents' },
          ].map(({ s, l }) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all mb-2',
                  step >= s
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white border-2 border-slate-100 text-slate-400'
                )}
              >
                {s}
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-widest',
                  step >= s ? 'text-indigo-600' : 'text-slate-400'
                )}
              >
                {l}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
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
              <div className="grid grid-cols-2 gap-4">
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
                <label className="label">Password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setStep(2)} className="btn-primary px-10">
                  Next: Profile Details
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900">Professional Profile</h2>
              <div>
                <label className="label">Specialisations</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(CeremonyType).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleSpecialisation(type)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        formData.specialisations.includes(type)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="label">Languages Spoken</label>
                  <input
                    type="text"
                    placeholder="Hindi, Sanskrit, English..."
                    className="input-field"
                    value={formData.languages.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        languages: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Bio / Description</label>
                <textarea
                  className="input-field h-32"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell devotees about your experience..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Address / Service Area</label>
                  <input
                    type="text"
                    placeholder="Street Address"
                    className="input-field mb-2"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="City"
                  className="input-field"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  className="input-field"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  className="input-field"
                  value={formData.address.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, pincode: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary px-8">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary px-10">
                  Next: Services
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Services & Pricing</h2>
                <button
                  type="button"
                  onClick={addService}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline"
                >
                  <Plus size={16} /> Add Another
                </button>
              </div>
              {formData.services.map((service, index) => (
                <div
                  key={index}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="label">Ceremony Type</label>
                      <select
                        className="input-field"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        required
                      >
                        <option value="">Select Ceremony</option>
                        {Object.values(CeremonyType).map((t) => (
                          <option key={t} value={t}>
                            {t}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="label">Short Description</label>
                      <input
                        type="text"
                        className="input-field"
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                        placeholder="What's included in this puja?"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary px-8">
                  Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary px-10">
                  Next: Documents
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Verification Documents</h2>
                <button
                  type="button"
                  onClick={addCertificate}
                  className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline"
                >
                  <Plus size={16} /> Add Certificate
                </button>
              </div>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                <AlertCircle className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700">
                  Please provide URLs to your educational or professional certificates for
                  verification. You can use services like Google Drive or Dropbox.
                </p>
              </div>
              {formData.certificates.map((cert, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <input
                    type="text"
                    placeholder="Certificate Name (e.g. Shastri Degree)"
                    className="input-field"
                    value={cert.name}
                    onChange={(e) => handleCertificateChange(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="url"
                    placeholder="File URL (Public Link)"
                    className="input-field"
                    value={cert.fileUrl}
                    onChange={(e) => handleCertificateChange(index, 'fileUrl', e.target.value)}
                    required
                  />
                </div>
              ))}
              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary px-8">
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary px-12">
                  {isLoading ? 'Submitting...' : 'Complete Registration'}
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
