import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { apiJson } from 'src/config/api';
import { account } from 'src/_mock/account';

import Iconify from 'src/components/iconify';
import PageHeading from 'src/components/operations/page-heading';

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [setup, setSetup] = useState(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  useEffect(() => {
    apiJson('/auth/me/').then(setProfile).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  const clearDialog = () => {
    setPassword('');
    setCode('');
    setDialogError('');
  };

  const startSetup = async () => {
    setError('');
    setBusy(true);
    try {
      const data = await apiJson('/auth/2fa/setup/', { method: 'POST' });
      clearDialog();
      setSetup(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const closeSetup = () => {
    setSetup(null);
    clearDialog();
  };

  const toggleTwoFactor = () => {
    if (profile?.two_factor_enabled) {
      clearDialog();
      setDisableOpen(true);
    } else startSetup();
  };

  const submitChange = async (event, action) => {
    event.preventDefault();
    setDialogError('');
    setBusy(true);
    try {
      const data = await apiJson(`/auth/2fa/${action}/`, {
        method: 'POST',
        body: JSON.stringify({ password, code: code.trim(), ...(action === 'confirm' ? { setup_token: setup.setup_token } : {}) }),
      });
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      setProfile((current) => ({ ...current, two_factor_enabled: data.two_factor_enabled }));
      if (action === 'confirm') {
        setRecoveryCodes(data.recovery_codes);
        setSetup(null);
      } else setDisableOpen(false);
      clearDialog();
    } catch (requestError) {
      setDialogError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const copyRecoveryCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
    } catch {
      setError('No se pudieron copiar los códigos.');
    }
  };

  if (loading) return <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeading title="Mi perfil" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {profile && (
        <>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Avatar src={account.photoURL} alt={profile.first_name || profile.username} sx={{ width: 52, height: 52 }} />
            <Box>
              <Typography variant="subtitle1">{[profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username}</Typography>
              <Typography variant="body2" color="text.secondary">{profile.email}</Typography>
            </Box>
          </Stack>
          <Box sx={{ py: 3, borderBottom: 1, borderColor: 'divider', maxWidth: 560 }}>
            <FormControlLabel
              control={<Switch checked={!!profile.two_factor_enabled} onChange={toggleTwoFactor} disabled={busy} />}
              label="Autenticación en dos pasos"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
              {profile.two_factor_enabled ? 'Activa' : 'Desactivada'}
            </Typography>
          </Box>
        </>
      )}

      <Dialog open={!!setup} onClose={closeSetup} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={(event) => submitChange(event, 'confirm')}>
          <DialogTitle>Activar autenticación en dos pasos</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
            <Typography variant="body2">Escanea el QR con tu app autenticadora.</Typography>
            {setup && <Box component="img" src={setup.qr_code} alt="Código QR de autenticación" sx={{ width: 200, height: 200, mx: 'auto' }} />}
            <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>Clave manual: {setup?.secret}</Typography>
            <TextField required fullWidth type="password" label="Contraseña" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <TextField required fullWidth label="Código de 6 dígitos" inputProps={{ inputMode: 'numeric', maxLength: 6 }} value={code} onChange={(event) => setCode(event.target.value)} />
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
          </DialogContent>
          <DialogActions><Button onClick={closeSetup}>Cancelar</Button><Button type="submit" variant="contained" disabled={busy}>Activar</Button></DialogActions>
        </Box>
      </Dialog>

      <Dialog open={disableOpen} onClose={() => { setDisableOpen(false); clearDialog(); }} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={(event) => submitChange(event, 'disable')}>
          <DialogTitle>Desactivar autenticación en dos pasos</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
            <TextField required fullWidth type="password" label="Contraseña" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <TextField required fullWidth label="Código de autenticación o recuperación" value={code} onChange={(event) => setCode(event.target.value)} />
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
          </DialogContent>
          <DialogActions><Button onClick={() => { setDisableOpen(false); clearDialog(); }}>Cancelar</Button><Button type="submit" color="error" variant="contained" disabled={busy}>Desactivar</Button></DialogActions>
        </Box>
      </Dialog>

      <Dialog open={!!recoveryCodes.length} fullWidth maxWidth="xs">
        <DialogTitle>Códigos de recuperación</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>Guárdalos en un lugar seguro. Solo se muestran una vez.</Alert>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, fontFamily: 'monospace' }}>
            {recoveryCodes.map((item) => <Typography key={item} variant="body2" sx={{ fontFamily: 'monospace' }}>{item}</Typography>)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Iconify icon="eva:copy-outline" />} onClick={copyRecoveryCodes}>Copiar</Button>
          <Button variant="contained" onClick={() => setRecoveryCodes([])}>Ya los guardé</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
