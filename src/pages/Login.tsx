import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import heroImage from '../assets/hero.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await api.post('/identity/login', { email, password });
      login(response.data.token);
      navigate('/');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } | string } };
      let errorMsg = 'Login failed. Invalid credentials or account blocked.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (typeof err.response.data === 'object' && 'message' in err.response.data && typeof err.response.data.message === 'string') {
          errorMsg = err.response.data.message;
        }
      }
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ width: '100%', overflowX: 'hidden' }}>
      <Container className="d-flex justify-content-center align-items-center" style={{ flex: 1, backgroundColor: '#fff', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '20px' }}>
          <h2 className="mb-4" style={{ color: '#0d6efd', fontWeight: 'bold', letterSpacing: '1px' }}>THE APP</h2>
          <p className="text-muted mb-1" style={{ fontSize: '14px', textAlign: 'left' }}>Start your journey</p>
          <h3 className="mb-4" style={{ fontWeight: '600', textAlign: 'left' }}>Sign In to The App</h3>
          
          {errorMessage && <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: '14px', textAlign: 'left' }}>{errorMessage}</Alert>}
          {successMessage && <Alert variant="success" className="py-2 mb-3" style={{ fontSize: '14px', textAlign: 'left' }}>{successMessage}</Alert>}

          <Form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <Form.Group className="mb-3">
              <InputGroup>
                <Form.Control 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="E-mail" 
                  style={{ borderRight: 'none' }}
                  autoComplete="off"
                />
                <InputGroup.Text style={{ backgroundColor: '#fff', borderLeft: 'none', color: '#999' }}>
                  ✉️
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <InputGroup>
                <Form.Control 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Password" 
                  style={{ borderRight: 'none' }}
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    backgroundColor: '#fff', 
                    borderLeft: 'none', 
                    borderColor: '#dee2e6',
                    color: showPassword ? '#0d6efd' : '#999',
                    padding: '0 12px'
                  }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4 d-flex justify-content-start align-items-center">
              <Form.Check 
                type="checkbox" 
                id="remember-me"
                label="Remember me" 
                className="text-muted"
                style={{ fontSize: '14px' }}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-4" style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd', padding: '10px' }}>
              Sign In
            </Button>
          </Form>
          
          <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
            <span className="text-muted">Don't have an account? <a href="/register" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: '500' }}>Sign up</a></span>
            <a href="/forgot-password" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</a>
          </div>
        </div>
      </Container>
      
      <div className="d-none d-lg-block" style={{ flex: 1, backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
      </div>
    </div>
  );
};

export default Login;

