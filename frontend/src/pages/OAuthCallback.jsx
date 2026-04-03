import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;
    
    console.log("=== OAuth Callback Page Loaded ===");
    
    const fetchUserAndLogin = async () => {
      try {
        // First get the authenticated user from Google OAuth
        const response = await fetch('http://localhost:8080/api/auth/user', {
          method: 'GET',
          credentials: 'include'
        });
        
        console.log("Response status:", response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Google user data:", userData);
          
          if (userData.authenticated && userData.email) {
            // Now find the user in your database by email to get the numeric ID
            const userResponse = await fetch(`http://localhost:8080/api/workers/by-email/${userData.email}`, {
              method: 'GET',
              credentials: 'include'
            });
            
            if (userResponse.ok) {
              const dbUser = await userResponse.json();
              console.log("Database user found:", dbUser);
              
              // Login with the numeric ID (NOT the email!)
              console.log("Logging in user with numeric ID:", dbUser.id);
              login(dbUser.id.toString());
              
              setProcessed(true);
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 500);
              return;
            } else {
              // User not found in database - redirect to registration
              console.error("User not found in database");
              setError("User not registered. Please sign up first.");
              setTimeout(() => navigate('/login', { replace: true }), 2000);
              return;
            }
          }
        }
        
        throw new Error("Could not get authenticated user");
        
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to get user info");
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };
    
    fetchUserAndLogin();
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
        <div style={{ textAlign: 'center' }}>
          <h2>Error: {error}</h2>
          <p>Redirecting to login...</p>
        </div>
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
        <h2>Completing Google Sign-In...</h2>
        <p>Please wait while we redirect you to your dashboard.</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}