import React, { useState } from 'react';
import { MapPin, Shield, Check, User, Mail, Phone, Lock } from 'lucide-react';

export default function RegistrationFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    zone: '',
    pincode: '',
    acceptTerms: false,
    acceptPrivacy: false
  });
  const [hyperLocalRisk, setHyperLocalRisk] = useState(null);
  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Location" },
    { number: 3, title: "Terms" },
    { number: 4, title: "Payment" }
  ];

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "Valid 10-digit phone required";
    if (!formData.password || formData.password.length < 8) newErrors.password = "Password must be 8+ characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.zone) newErrors.zone = "Please select your zone";
    if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = "Valid 6-digit pincode required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchHyperLocalRisk = async (pincode) => {
    try {
      const response = await fetch(`http://localhost:8080/api/risk/hyperlocal/${pincode}`);
      const data = await response.json();
      setHyperLocalRisk(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch risk data:", error);
      return null;
    }
  };

  const handlePincodeBlur = async () => {
    if (formData.pincode.length === 6 && formData.zone) {
      const risk = await fetchHyperLocalRisk(formData.pincode);
      if (risk) {
        alert(`📍 Your area risk level: ${risk.riskLevel}\n💰 Estimated premium: ₹${risk.recommendedPremium}/week`);
      }
    }
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      await handlePincodeBlur();
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            zone: formData.zone,
            pincode: formData.pincode
          })
        });
        
        if (response.ok) {
          onComplete(formData);
        } else {
          const error = await response.text();
          setErrors({ submit: error });
        }
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  const getZoneName = (zoneId) => {
    const zones = {
      'Zone_A_Bangalore': 'Bangalore',
      'Zone_B_Mumbai': 'Mumbai',
      'Zone_C_Delhi': 'Delhi',
      'Zone_D_Hyderabad': 'Hyderabad',
      'Zone_E_Chennai': 'Chennai'
    };
    return zones[zoneId] || zoneId;
  };

  // Progress percentage
  const progress = ((step - 1) / 3) * 100;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          {steps.map(s => (
            <div key={s.number} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: step >= s.number ? '#667eea' : '#e5e7eb',
                color: step >= s.number ? 'white' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                {step > s.number ? '✓' : s.number}
              </div>
              <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', color: step >= s.number ? '#667eea' : '#9ca3af' }}>
                {s.title}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', marginTop: '0.5rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#667eea', borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Create Your Account</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Full Name</label>
            <input
              type="text"
              placeholder="Ravi Kumar"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
            {errors.name && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.name}</div>}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Email</label>
            <input
              type="email"
              placeholder="ravi@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
            {errors.email && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.email}</div>}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Mobile Number</label>
            <input
              type="tel"
              placeholder="9876543210"
              maxLength="10"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
            {errors.phone && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.phone}</div>}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
            {errors.password && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.password}</div>}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
            {errors.confirmPassword && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</div>}
          </div>
        </div>
      )}

      {/* Step 2: Location & Zone */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Select Your Delivery Zone</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Your premium is calculated based on hyper-local risk factors
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>City / Zone</label>
            <select
              value={formData.zone}
              onChange={(e) => setFormData({...formData, zone: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            >
              <option value="">Select your city</option>
              <option value="Zone_A_Bangalore">Bangalore</option>
              <option value="Zone_B_Mumbai">Mumbai</option>
              <option value="Zone_C_Delhi">Delhi</option>
              <option value="Zone_D_Hyderabad">Hyderabad</option>
              <option value="Zone_E_Chennai">Chennai</option>
            </select>
            {errors.zone && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.zone}</div>}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Delivery Area / Pincode</label>
            <input
              type="text"
              placeholder="6-digit pincode"
              maxLength="6"
              value={formData.pincode}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
              onBlur={handlePincodeBlur}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
            {errors.pincode && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>{errors.pincode}</div>}
          </div>
          
          {hyperLocalRisk && (
            <div style={{
              background: hyperLocalRisk.riskLevel === 'HIGH' ? '#fef2f2' : '#ecfdf5',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              border: `1px solid ${hyperLocalRisk.riskLevel === 'HIGH' ? '#ef4444' : '#10b981'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <MapPin size={16} />
                <strong>Area Risk Profile</strong>
              </div>
              <div style={{ fontSize: '0.875rem' }}>
                <div>Risk Level: <strong style={{ color: hyperLocalRisk.riskLevel === 'HIGH' ? '#ef4444' : '#10b981' }}>{hyperLocalRisk.riskLevel}</strong></div>
                <div>Estimated Premium: <strong>₹{hyperLocalRisk.recommendedPremium}/week</strong></div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Based on historical flood, traffic, and pollution data for your area
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Terms & Coverage */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Terms & Coverage Agreement</h2>
          
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            maxHeight: '300px',
            overflow: 'auto',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            background: '#f9fafb'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Coverage Terms</h3>
            <p>This policy covers income loss due to:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>✅ Heavy Rainfall (&gt;40mm/hr for 60+ minutes)</li>
              <li>✅ Extreme Heat (&gt;42°C)</li>
              <li>✅ Severe Pollution (AQI &gt; 350)</li>
              <li>✅ Traffic Congestion (Index &gt; 0.8)</li>
              <li>✅ Platform Downtime (&gt;30 minutes)</li>
            </ul>
            <p><strong>Exclusions:</strong> Health issues, accidents, vehicle damage, medical expenses.</p>
            <p><strong>Premium:</strong> Weekly payment required to maintain coverage.</p>
            <p><strong>Payouts:</strong> Automatic when triggers are met. No claim filing required.</p>
            <p><strong>Cancellation:</strong> You may cancel anytime. No refunds for remaining period.</p>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
            />
            I agree to the Terms & Conditions
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.acceptPrivacy}
              onChange={(e) => setFormData({...formData, acceptPrivacy: e.target.checked})}
            />
            I agree to the Privacy Policy
          </label>
          
          {errors.submit && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginBottom: '1rem' }}>{errors.submit}</div>}
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Complete Payment</h2>
          
          <div style={{
            background: '#f3f4f6',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Weekly Premium</span>
              <span style={{ fontWeight: 'bold' }}>₹{hyperLocalRisk?.recommendedPremium || 27.5}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Coverage Amount</span>
              <span style={{ fontWeight: 'bold' }}>₹1,500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d1d5db', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span>Total (1 week)</span>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{hyperLocalRisk?.recommendedPremium || 27.5}</span>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Payment Method</label>
            <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <option>UPI (Google Pay, PhonePe, etc.)</option>
              <option>Credit / Debit Card</option>
              <option>Net Banking</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>UPI ID</label>
            <input
              type="text"
              placeholder="username@okhdfcbank"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginLeft: step > 1 ? 'auto' : '0',
            width: step === 1 ? '100%' : 'auto',
            opacity: loading ? 0.7 : 1,
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Processing...' : step === 4 ? 'Pay & Activate' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}