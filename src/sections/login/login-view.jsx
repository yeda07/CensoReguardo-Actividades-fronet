import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';
import { API_BASE_URL } from 'src/config/api';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

import { useAuth } from 'src/sections/context/AuthContext';

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [challengeToken, setChallengeToken] = useState('');
  const [code, setCode] = useState('');

  const handleClick = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${challengeToken ? '/api/token/verify/' : '/api/token/'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challengeToken
          ? { challenge_token: challengeToken, code: code.trim() }
          : { email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok && data.requires_2fa) {
        setChallengeToken(data.challenge_token);
        setCode('');
      } else if (response.ok) {
        localStorage.setItem('token', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        login();
        router.push('/');
      } else {
        setError(data.detail || data.code || 'No se pudo iniciar sesión');
      }
    } catch (requestError) {
      setError(`Error de conexión: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = challengeToken ? (
    <>
      <TextField
        fullWidth
        autoFocus
        required
        label="Código de autenticación o recuperación"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        inputProps={{ autoComplete: 'one-time-code' }}
      />
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <LoadingButton fullWidth size="large" type="submit" variant="contained" color="inherit" loading={loading} sx={{ mt: 3 }}>Verificar</LoadingButton>
      <Button onClick={() => { setChallengeToken(''); setCode(''); setError(null); }} sx={{ mt: 1 }}>Volver</Button>
    </>
  ) : (
    <>
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          name="password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
      >
        Ingresar
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        minHeight: '100vh',
        px: 2,
      }}
    >
      <Logo sx={{ position: 'fixed', top: { xs: 16, md: 24 }, left: { xs: 16, md: 24 } }} />
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}>
        <Card
          component="form"
          onSubmit={handleClick}
          sx={{
            p: { xs: 3, sm: 5 },
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">{challengeToken ? 'Verifica tu identidad' : 'Inicia sesión'}</Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Censo del resguardo</Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
