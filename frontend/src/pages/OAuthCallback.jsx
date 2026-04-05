import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [processed, setProcessed] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    if (processed) return;
    
    console.log("=== OAuth Callback Page Loaded ===");
    
    // Get user info from URL params (sent from backend)
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const nameParam = urlParams.get('name');
    
    console.log("Email from URL:", emailParam);
    console.log("Name from URL:", nameParam);
    
    if (!emailParam) {
      setError("No email received from Google. Please try again.");
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      setProcessed(true);
      return;
    }
    
    setEmail(emailParam);
    setName(nameParam || '');
    
    // Save to localStorage for auto-fill in registration form
    localStorage.setItem('googleEmail', emailParam);
    if (nameParam) localStorage.setItem('googleName', nameParam);
    
    // Check if user already exists in database
    const checkExistingUser = async () => {
      try {
        console.log("🔍 Checking if user exists with email:", emailParam);
        
        // Try to find user by email
        const response = await fetch(`https://delivershield-backend.onrender.com/api/auth/check-email/${encodeURIComponent(emailParam)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          // User exists! Auto-login them
          const userData = await response.json();
          console.log("✅ Existing user found:", userData);
          
          if (userData.id) {
            // Login the user
            login(userData.id.toString());
            // Redirect to dashboard
            navigate('/dashboard', { replace: true });
            return;
          }
        } else {
          console.log("📝 User not found, needs registration");
        }
      } catch (err) {
        console.log("Error checking user:", err.message);
        // Continue to registration flow
      }
      
      // User doesn't exist - redirect to registration with auto-fill
      setCheckingUser(false);
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Redirect after 3 seconds
      const redirectTimer = setTimeout(() => {
        navigate('/login?googleEmail=' + encodeURIComponent(emailParam) + '&googleName=' + encodeURIComponent(nameParam || ''), { replace: true });
      }, 3000);
      
      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimer);
      };
    };
    
    checkExistingUser();
    setProcessed(true);
  }, [login, navigate, processed]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.7)', padding: '2rem', borderRadius: '1rem', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1rem' }}>⚠️ {error}</h2>
          <p>Redirecting to login page...</p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#667eea',
              fontWeight: 'bold'
            }}
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  if (checkingUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>Checking your account...</h2>
          <p>Please wait</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 1rem' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        
        <h2 style={{ marginBottom: '0.5rem' }}>Google Sign-In Successful! 🎉</h2>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '1rem', 
          borderRadius: '0.75rem',
          margin: '1.5rem 0',
          textAlign: 'left'
        }}>
          <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {email}</p>
          {name && <p><strong>Name:</strong> {name}</p>}
        </div>
        
        <div style={{ 
          background: 'rgba(255,193,7,0.2)', 
          padding: '1rem', 
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          borderLeft: '3px solid #ffc107'
        }}>
          <p style={{ fontSize: '0.9rem' }}>
            ⚠️ <strong>Phone number required</strong><br />
            Please complete registration with your mobile number to activate insurance coverage.
          </p>
        </div>
        
        <p>Redirecting to registration page in <strong>{countdown}</strong> seconds...</p>
        
        <button 
          onClick={() => navigate('/login?googleEmail=' + encodeURIComponent(email) + '&googleName=' + encodeURIComponent(name))}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            background: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: '#667eea',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          Continue Now →
        </button>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}