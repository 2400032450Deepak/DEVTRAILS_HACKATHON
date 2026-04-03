import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser, googleLogin } from '../api/config';
import { 
  Shield, Mail, Lock, User, Phone, Eye, EyeOff, 
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });

  const { login } = useAuth();
  const navigate = useNavigate();

   useEffect(() => {
    // Check if coming from Google OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      console.log("🔐 Google auth code received:", code);
      // After Google login, fetch user info
      fetch('http://localhost:8080/api/auth/google/success', {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        console.log("✅ Google user data:", data);
        if (data.email) {
          // Create or login user with Google email
          login(data.email);
          navigate('/dashboard');
        }
      })
      .catch(err => console.error('Google login error:', err));
    }
  }, []);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      message: '',
      hasLength: password.length >= 8,
      hasNumber: /[0-9]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    let score = 0;
    if (strength.hasLength) score++;
    if (strength.hasNumber) score++;
    if (strength.hasUpper) score++;
    if (strength.hasLower) score++;
    if (strength.hasSpecial) score++;

    let message = '';
    if (score <= 2) message = 'Weak password';
    else if (score <= 3) message = 'Fair password';
    else if (score <= 4) message = 'Good password';
    else message = 'Strong password';

    setPasswordStrength({ ...strength, score, message });
    return score;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    setSuccessMsg('');

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (Indian 10-digit)
  const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Validation
    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }

      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (!isValidPhone(formData.phone)) {
        setError('Please enter a valid 10-digit Indian mobile number (starting with 6-9)');
        setLoading(false);
        return;
      }

      if (passwordStrength.score < 3) {
        setError('Please use a stronger password (8+ chars with numbers, uppercase, special characters)');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.phone || !formData.password) {
        setError('Please enter phone number and password');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const res = await loginUser(formData.phone, formData.password);
        const userId = res.user?.id || res.userId || formData.phone;
        login(userId);
        navigate('/dashboard');
      } else {
        await registerUser(formData.name, formData.email, formData.phone, formData.password);
        setSuccessMsg('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = () => {
    // For demo purposes - in production, implement actual Google OAuth
    window.open('http://localhost:8080/oauth2/authorization/google', '_self');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Shield size={35} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            DeliverShield AI
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            color: '#065f46',
            fontSize: '0.875rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
          }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            fontSize: '0.875rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </>
          )}

          <div className="input-group">
            <Phone size={18} className="input-icon" />
            <input
              type="tel"
              name="phone"
              placeholder={isLogin ? "Phone Number" : "10-digit Mobile Number"}
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              required
              className="input-field"
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {!isLogin && formData.password && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '4px',
                      background: level <= passwordStrength.score ? 
                        (passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score <= 3 ? '#f59e0b' : '#10b981') 
                        : '#e5e7eb',
                      borderRadius: '2px',
                    }}
                  />
                ))}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: passwordStrength.score <= 2 ? '#ef4444' : passwordStrength.score <= 3 ? '#f59e0b' : '#10b981',
                marginBottom: '0.5rem'
              }}>
                {passwordStrength.message}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.65rem' }}>
                <span style={{ color: passwordStrength.hasLength ? '#10b981' : '#9ca3af' }}>
                  {passwordStrength.hasLength ? '✓' : '○'} 8+ characters
                </span>
                <span style={{ color: passwordStrength.hasNumber ? '#10b981' : '#9ca3af' }}>
                  {passwordStrength.hasNumber ? '✓' : '○'} Number
                </span>
                <span style={{ color: passwordStrength.hasUpper ? '#10b981' : '#9ca3af' }}>
                  {passwordStrength.hasUpper ? '✓' : '○'} Uppercase
                </span>
                <span style={{ color: passwordStrength.hasLower ? '#10b981' : '#9ca3af' }}>
                  {passwordStrength.hasLower ? '✓' : '○'} Lowercase
                </span>
                <span style={{ color: passwordStrength.hasSpecial ? '#10b981' : '#9ca3af' }}>
                  {passwordStrength.hasSpecial ? '✓' : '○'} Special char
                </span>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              marginTop: '1rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          margin: '1.5rem 0',
          color: '#9ca3af',
          fontSize: '0.75rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#374151',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          <Mail size={20} style={{ color: '#db4437' }} />
          Continue with Google
        </button>

        {/* Toggle between Login/Register */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
              setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: ''
              });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#9ca3af',
        }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>

      <style>{`
        .input-group {
          position: relative;
          margin-bottom: 1rem;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}