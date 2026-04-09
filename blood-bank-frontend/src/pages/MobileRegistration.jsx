import React, { useState } from 'react';
import donorService from '../services/donorService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';

const MobileRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    registeredBy: 'mobile'
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await donorService.register(formData);
      if (result.alreadyExists) {
        setMessage('You are already registered! Our lab will verify your details.');
      } else {
        setMessage('Successfully registered! Please visit our lab for blood type testing.');
        setFormData({ name: '', age: '', phone: '', address: '', registeredBy: 'mobile' });
      }
    } catch (error) {
      setMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-brand-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-600"></div>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Donor Portal</h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Self Registration</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center text-sm font-bold shadow-sm ${message.includes('Success') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-brand-50 text-brand-700 border border-brand-100'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="Age" type="number" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
          <Input label="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <Input label="Address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          
          <Button type="submit" isLoading={loading} className="w-full h-12 text-lg shadow-xl shadow-brand-100 hover:scale-[1.02] transition-transform">
             Register Me
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors">
                 Lab Staff Sign In
            </button>
        </div>
      </Card>
    </div>
  );
};

export default MobileRegistration;
