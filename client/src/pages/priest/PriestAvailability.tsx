import React, { useEffect, useState } from 'react';
import { usePriests } from '../../hooks/usePriests';
import { IPriestProfile, IWeeklySchedule, ISlot, IAvailabilityOverride } from '../../types/priest';
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PriestAvailability: React.FC = () => {
  const { getMyProfile, updateAvailability, addAvailabilityOverride, loading } = usePriests();
  const [profile, setProfile] = useState<IPriestProfile | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<IWeeklySchedule[]>([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [newOverride, setNewOverride] = useState<IAvailabilityOverride>({
    date: '',
    isAvailable: false,
  });

  useEffect(() => {
    getMyProfile().then((data) => {
      if (data) {
        setProfile(data);
        setWeeklySchedule(data.weeklySchedule || []);
      }
    });
  }, []);

  const handleAddSlot = (dayIndex: number): void => {
    const existingDay = weeklySchedule.find((s) => s.dayOfWeek === dayIndex);
    if (existingDay) {
      const newSchedule = weeklySchedule.map((s) =>
        s.dayOfWeek === dayIndex
          ? { ...s, slots: [...s.slots, { startTime: '09:00', endTime: '13:00' }] }
          : s
      );
      setWeeklySchedule(newSchedule);
    } else {
      setWeeklySchedule([
        ...weeklySchedule,
        { dayOfWeek: dayIndex, slots: [{ startTime: '09:00', endTime: '13:00' }] },
      ]);
    }
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number): void => {
    const newSchedule = weeklySchedule
      .map((s) => {
        if (s.dayOfWeek === dayIndex) {
          const newSlots = s.slots.filter((_: ISlot, i: number) => i !== slotIndex);
          return { ...s, slots: newSlots };
        }
        return s;
      })
      .filter((s) => s.slots.length > 0);
    setWeeklySchedule(newSchedule);
  };

  const handleTimeChange = (
    dayIndex: number,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ): void => {
    const newSchedule = weeklySchedule.map((s) => {
      if (s.dayOfWeek === dayIndex) {
        const newSlots = [...s.slots];
        newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
        return { ...s, slots: newSlots };
      }
      return s;
    });
    setWeeklySchedule(newSchedule);
  };

  const handleSave = async (): Promise<void> => {
    await updateAvailability(weeklySchedule);
  };

  const handleOverrideSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const result = await addAvailabilityOverride(newOverride);
    if (result.success) {
      setShowOverrideModal(false);
      setNewOverride({ date: '', isAvailable: false });
      getMyProfile().then(setProfile);
    }
  };

  if (loading && !profile) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Availability</h1>
          <p className="text-slate-500">Set your weekly routine and working hours</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      <div className="card p-6 bg-blue-50 border-blue-100 flex gap-4 mb-8">
        <AlertCircle className="text-blue-600 shrink-0" />
        <p className="text-sm text-blue-700">
          Your weekly schedule defines when you're visible to users. You can also block specific
          dates from your calendar if you're planning a holiday.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Weekly Routine</h2>
        {DAYS.map((day, index) => {
          const daySchedule = weeklySchedule.find((s) => s.dayOfWeek === index);
          return (
            <div key={day} className="card p-6 flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-32">
                <span className="font-bold text-slate-900">{day}</span>
              </div>

              <div className="flex-1 space-y-3">
                {daySchedule && daySchedule.slots.length > 0 ? (
                  daySchedule.slots.map((slot: ISlot, sIdx: number) => (
                    <div key={sIdx} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Clock size={14} className="text-slate-400" />
                        <input
                          type="time"
                          className="bg-transparent text-sm font-medium focus:outline-none"
                          value={slot.startTime}
                          onChange={(e) =>
                            handleTimeChange(index, sIdx, 'startTime', e.target.value)
                          }
                        />
                        <span className="text-slate-300">to</span>
                        <input
                          type="time"
                          className="bg-transparent text-sm font-medium focus:outline-none"
                          value={slot.endTime}
                          onChange={(e) => handleTimeChange(index, sIdx, 'endTime', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(index, sIdx)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic">Unavailable</span>
                )}
              </div>

              <button
                onClick={() => handleAddSlot(index)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all"
              >
                <Plus size={14} /> Add Slot
              </button>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Date Overrides</h2>
          <button
            onClick={() => setShowOverrideModal(true)}
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:underline"
          >
            <Plus size={16} /> Add Date Override
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile?.availabilityOverrides && profile.availabilityOverrides.length > 0 ? (
            profile.availabilityOverrides.map((override: IAvailabilityOverride, idx: number) => (
              <div
                key={idx}
                className="card p-4 flex justify-between items-center border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      override.isAvailable
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    )}
                  >
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {new Date(override.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {override.isAvailable ? 'Extra Availability' : 'Blocked'}
                    </p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-rose-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 italic">
                No overrides set. Your weekly routine applies to all dates.
              </p>
            </div>
          )}
        </div>
      </div>

      {showOverrideModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">Add Date Override</h3>
            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="label">Select Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={newOverride.date}
                  onChange={(e) => setNewOverride({ ...newOverride, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={newOverride.isAvailable}
                  onChange={(e) =>
                    setNewOverride({ ...newOverride, isAvailable: e.target.checked })
                  }
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-slate-700">
                  I am available on this date
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriestAvailability;
