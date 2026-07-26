import { useState, useEffect } from 'react';
import { add_barber } from '../../Api/Barber';
import { getcatalog } from '../../Api/Shops';

const Barber = () => {
  const [shopId] = useState(localStorage.getItem('shop'));
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalog, setCatalog] = useState([]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    startHour: '',
    endHour: '',
    role: 'barber',
    services: []
  });

  const STEPS = [
    { id: 1, title: 'Credentials', description: 'Account Login' },
    { id: 2, title: 'Profile & Hours', description: 'Personal Details' },
    { id: 3, title: 'Services & Role', description: 'Permissions & Offerings' }
  ];

  useEffect(() => {
    async function fetchServices(id) {
      if (!id) return;
      try {
        const services = await getcatalog(id);
        setCatalog(services || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }
    fetchServices(shopId);
  }, [shopId]);

  // Handle service duration updates
  const updateServiceDuration = (serviceId, newDuration) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.service === serviceId ? { ...s, duration: newDuration } : s
      )
    }));
  };

  // Toggle service selection
  const toggleService = (item) => {
    setFormData((prev) => {
      const exists = prev.services.some((s) => s.service === item._id);
      if (exists) {
        return {
          ...prev,
          services: prev.services.filter((s) => s.service !== item._id)
        };
      }
      return {
        ...prev,
        services: [...prev.services, { service: item._id, duration: 30 }]
      };
    });
  };

  // Step validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.email || !formData.password) {
        alert('Please provide both email and password.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.name || !formData.phone || !formData.startHour || !formData.endHour) {
        alert('Please fill out all profile fields and working hours.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      await add_barber({
        name: formData.name,
        ph_number: formData.phone,
        shopId: shopId,
        services: formData.services,
        role: formData.role,
        email: formData.email,
        password: formData.password,
        hours_start: formData.startHour,
        hours_end: formData.endHour
      });
      alert('Barber added successfully!');
      // Reset or redirect logic here
    } catch (error) {
      console.error('Error adding barber:', error);
      alert('Failed to create barber account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress Bar Percentage
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="bg-black py-6 px-6 sm:px-10 text-center relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Add New Barber</h2>
          <p className="text-gray-400 text-sm mt-1">Register a professional to your shop team</p>

          {/* Stepper Dots / Labels */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-800 pt-6">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'bg-indigo-600 text-white'
                        : isActive
                        ? 'bg-white text-black ring-4 ring-indigo-600/30'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span className={`text-xs mt-2 hidden sm:block ${isActive ? 'text-white font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-gray-200 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Form Body Container */}
        <div className="p-6 sm:p-10 min-h-[380px] flex flex-col justify-between">
          
          {/* Animated Step Container */}
          <div key={currentStep} className="animate-fadeIn transition-opacity duration-300">
            
            {/* STEP 1: CREDENTIALS */}
            {currentStep === 1 && (
              <section className="space-y-6">
                <div className="border-b border-gray-200 pb-3">
                  <h3 className="text-lg font-bold text-gray-900">Step 1: Account Credentials</h3>
                  <p className="text-xs text-gray-500">Set up login details for the barber</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="barber@shop.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm text-gray-900"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: PROFILE & HOURS */}
            {currentStep === 2 && (
              <section className="space-y-6">
                <div className="border-b border-gray-200 pb-3">
                  <h3 className="text-lg font-bold text-gray-900">Step 2: Profile & Working Hours</h3>
                  <p className="text-xs text-gray-500">Add personal info and daily shift timing</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+123456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift Schedule</label>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-300">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Starts At</span>
                      <input
                        type="time"
                        value={formData.startHour}
                        onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
                      />
                    </div>
                    <div className="h-8 w-px bg-gray-300" />
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Ends At</span>
                      <input
                        type="time"
                        value={formData.endHour}
                        onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 3: SERVICES & ROLE */}
            {currentStep === 3 && (
              <section className="space-y-6">
                <div className="border-b border-gray-200 pb-3">
                  <h3 className="text-lg font-bold text-gray-900">Step 3: Role & Services</h3>
                  <p className="text-xs text-gray-500">Assign role access and set up offered services</p>
                </div>

                {/* Role Radio Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        formData.role === 'barber'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-600/20'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="barber"
                        checked={formData.role === 'barber'}
                        onChange={() => setFormData({ ...formData, role: 'barber' })}
                        className="sr-only"
                      />
                      Standard Barber
                    </label>

                    <label
                      className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        formData.role === 'barber_admin'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-600/20'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="barber_admin"
                        checked={formData.role === 'barber_admin'}
                        onChange={() => setFormData({ ...formData, role: 'barber_admin' })}
                        className="sr-only"
                      />
                      Shop Admin
                    </label>
                  </div>
                </div>

                {/* Catalog Services List */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Services</label>
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {catalog.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-4 text-center border border-dashed rounded-xl">
                        No services available in catalog.
                      </p>
                    ) : (
                      catalog.map((item) => {
                        const currentService = formData.services.find((s) => s.service === item._id);
                        const isSelected = !!currentService;

                        return (
                          <div
                            key={item._id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isSelected
                                ? 'border-indigo-200 bg-indigo-50/30'
                                : 'border-gray-200 bg-gray-50 opacity-70'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleService(item)}
                                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && <span className="text-xs font-bold">✓</span>}
                              </button>
                              <div>
                                <p className={`text-xs font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {item.service}
                                </p>
                                <p className="text-[10px] text-gray-400">{item.price} Leke</p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateServiceDuration(
                                      item._id,
                                      Math.max(5, currentService.duration - 5)
                                    )
                                  }
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-bold text-gray-800">
                                  {currentService.duration} <span className="text-[9px] text-gray-400">m</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateServiceDuration(item._id, currentService.duration + 5)
                                  }
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                currentStep === 1
                  ? 'opacity-0 cursor-default'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
              }`}
            >
              Back
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Create Account'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Barber;