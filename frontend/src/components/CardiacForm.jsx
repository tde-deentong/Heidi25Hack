import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const CardiacForm = ({ initialData = {}, onSubmitted = null }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    chestPain: initialData.chestPain || '',
    chestPainOnExertion: initialData.chestPainOnExertion || '',
    palpitations: initialData.palpitations || '',
    shortnessBreath: initialData.shortnessBreath || '',
    fainting: initialData.fainting || '',
    medications: initialData.medications || '',
    historyHeartDisease: initialData.historyHeartDisease || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user) {
        const questionnaireData = {
          type: 'cardiac',
          clinic: 'Cardiology Clinic',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: 'TBD',
          ...form,
          submittedAt: new Date().toISOString(),
        };
        await authService.saveQuestionnaire(user.id, questionnaireData);
      }

      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Error submitting cardiac form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-[#2A1B1B]">Cardiac Questionnaire</h2>

      <div>
        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">Have you had chest pain recently?</label>
        <select name="chestPain" value={form.chestPain} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">Is the chest pain brought on by exertion?</label>
        <select name="chestPainOnExertion" value={form.chestPainOnExertion} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unsure">Unsure</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">Do you experience palpitations?</label>
        <select name="palpitations" value={form.palpitations} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">Do you get shortness of breath?</label>
        <select name="shortnessBreath" value={form.shortnessBreath} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">Have you fainted or nearly fainted?</label>
        <select name="fainting" value={form.fainting} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">Current cardiac medications (if any)</label>
        <input type="text" name="medications" value={form.medications} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="List medications and doses" />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#2A1B1B] mb-2">Any history of heart disease?</label>
        <input type="text" name="historyHeartDisease" value={form.historyHeartDisease} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="E.g., previous MI, stent, valve disease" />
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-[#2A1B1B] text-white rounded-lg font-medium hover:bg-[#1A0F0F] transition-colors disabled:bg-gray-300">
          {isSubmitting ? 'Submitting...' : 'Submit Cardiac Form'}
        </button>
      </div>
    </form>
  );
};

export default CardiacForm;
