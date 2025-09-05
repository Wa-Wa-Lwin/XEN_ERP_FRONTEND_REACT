import { useState } from 'react';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempt:', { username, password });
    }, 1000);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    wrapper: {
      width: '100%',
      maxWidth: '28rem'
    },
    logoSection: {
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    logoContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '5rem',
      height: '5rem',
      backgroundColor: 'white',
      borderRadius: '50%',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      marginBottom: '1rem'
    },
    logoIcon: {
      width: '3rem',
      height: '3rem',
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.25rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#6b7280'
    },
    card: {
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: 'none'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    checkboxInput: {
      width: '1rem',
      height: '1rem',
      accentColor: '#2563eb'
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    forgotLink: {
      fontSize: '0.875rem',
      color: '#2563eb',
      textDecoration: 'none'
    },
    footer: {
      marginTop: '1.5rem',
      textAlign: 'center' as const
    },
    footerText: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    footerLink: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: '500'
    },
    copyright: {
      textAlign: 'center' as const,
      marginTop: '2rem'
    },
    copyrightText: {
      fontSize: '0.75rem',
      color: '#9ca3af'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <span style={styles.logoText}>X</span>
            </div>
          </div>
          <h1 style={styles.title}>XenoOptics</h1>
          <p style={styles.subtitle}>Shipment Management System</p>
        </div>

        {/* Login Card */}
        <Card style={styles.card}>
          <CardHeader style={{ paddingBottom: '0.5rem' }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>Welcome Back</h2>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Sign in to your account</p>
            </div>
          </CardHeader>
          <CardBody style={{ paddingTop: '0.5rem' }}>
            <form onSubmit={handleLogin} style={styles.form}>
              {/* Username Field */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Username</label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <Input
                  type={isVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  endContent={
                    <button
                      type="button"
                      onClick={toggleVisibility}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {isVisible ? (
                        <EyeSlashIcon style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                      ) : (
                        <EyeIcon style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                      )}
                    </button>
                  }
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={styles.checkboxContainer}>
                <label style={styles.checkbox}>
                  <input
                    type="checkbox"
                    style={styles.checkboxInput}
                  />
                  <span style={styles.checkboxLabel}>Remember me</span>
                </label>
                <a href="#" style={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '500'
                }}
                isLoading={isLoading}
                disabled={!username || !password}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Footer */}
            <div style={styles.footer}>
              <p style={styles.footerText}>
                Don't have an account?{' '}
                <a href="#" style={styles.footerLink}>
                  Contact administrator
                </a>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Copyright */}
        <div style={styles.copyright}>
          <p style={styles.copyrightText}>
            © 2024 XenoOptics. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;