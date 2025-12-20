import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import './Login.css';

// JWT decode function
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

function Login({ setUser }) {
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = parseJwt(credentialResponse.credential);


      const userData = {
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
        profilePicture: decoded.picture,
      };

      const response = await authAPI.googleLogin(userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);

      // Check if profile is complete based on role
      const user = response.data.user;

      let isProfileComplete = true;
      if (user.role === 'STUDENT') {
        isProfileComplete = user.vtuNumber && user.yearOfStudy && user.contactNumber && user.department;
      } else if (user.role === 'FACULTY') {
        isProfileComplete = user.ttsId && user.contactNumber && user.department;
      }

      if (!isProfileComplete) {
        navigate('/profile-setup');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>📄 Paperless</h1>
          <p>Digital Document Management System</p>
        </div>

        <div className="login-body">
          <h2>Welcome Back!</h2>
          <p className="login-subtitle">Sign in with your Google account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
        </div>

        <div className="login-footer">
          <p>🎓 For College Students & Faculty</p>
          <p>Secure • Fast • Paperless</p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="admin-panel-btn"
          >
            🔐 Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
