import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { apiJson } from 'src/config/api';

import PersonaFields, { EMPTY_PERSONA, personaPayload } from 'src/components/operations/persona-fields';

export default function PersonaFormDialog({ open, onClose, onSaved, familiaId, persona, registradoPor, vigenciaSugerida }) {
  const [form, setForm] = useState(EMPTY_PERSONA);
  const [censoForm, setCensoForm] = useState({ vigencia: '', resguardo_ind: '', comunidad_ind: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(persona ? { ...EMPTY_PERSONA, ...persona } : { ...EMPTY_PERSONA, usuario: registradoPor || 'Registro web', familida_id: familiaId });
    setCensoForm({ vigencia: vigenciaSugerida || String(new Date().getFullYear()), resguardo_ind: '', comunidad_ind: '' });
    setError('');
  }, [persona, open, familiaId, registradoPor, vigenciaSugerida]);

  const change = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...personaPayload(form), familida_id: Number(familiaId) };
      if (persona) {
        const saved = await apiJson(`/persona/${persona.id}/`, {
          method: 'PATCH', body: JSON.stringify(payload),
        });
        onSaved(saved);
      } else {
        const record = await apiJson('/censo/', {
          method: 'POST',
          body: JSON.stringify({
            vigencia: censoForm.vigencia.trim(),
            resguardo_ind: Number(censoForm.resguardo_ind),
            comunidad_ind: Number(censoForm.comunidad_ind),
            persona: payload,
          }),
        });
        onSaved(record.persona, record);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <Box component="form" onSubmit={save}>
        <DialogTitle>{persona ? 'Editar integrante' : 'Nuevo integrante'}</DialogTitle>
        <DialogContent dividers>
          {!persona && <>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Datos del censo</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}><TextField fullWidth required size="small" label="Vigencia" value={censoForm.vigencia} onChange={(event) => setCensoForm((current) => ({ ...current, vigencia: event.target.value }))} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth required size="small" type="number" inputProps={{ min: 1 }} label="Resguardo Indígena" value={censoForm.resguardo_ind} onChange={(event) => setCensoForm((current) => ({ ...current, resguardo_ind: event.target.value }))} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth required size="small" type="number" inputProps={{ min: 1 }} label="Comunidad Indígena" value={censoForm.comunidad_ind} onChange={(event) => setCensoForm((current) => ({ ...current, comunidad_ind: event.target.value }))} /></Grid>
            </Grid>
          </>}
          <PersonaFields form={form} onChange={change} />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>{persona ? 'Guardar integrante' : 'Guardar y censar'}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

PersonaFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  familiaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  persona: PropTypes.object,
  registradoPor: PropTypes.string,
  vigenciaSugerida: PropTypes.string,
};
