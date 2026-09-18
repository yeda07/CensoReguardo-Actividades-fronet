import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { matchesAgeRange, ageFromBirthDate } from 'src/utils/age';

import { apiJson, apiFetch, API_BASE_URL } from 'src/config/api';

import Iconify from 'src/components/iconify';
import StatusChip from 'src/components/operations/status-chip';
import PageHeading from 'src/components/operations/page-heading';
import AgeRangeFilter from 'src/components/operations/age-range-filter';
import ListPagination, { useListPagination } from 'src/components/operations/list-pagination';
import PersonaFields, { EMPTY_PERSONA, personaPayload } from 'src/components/operations/persona-fields';

const emptyForm = (usuario = '') => ({
  persona_id: '', vigencia: String(new Date().getFullYear()), resguardo_ind: '', comunidad_ind: '',
  personaData: { ...EMPTY_PERSONA, usuario },
});

export default function CensoWorkspace() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const captura = params.get('captura') === '1' && !!params.get('familia_id') && !!params.get('vigencia');
  const capturaFamiliaId = params.get('familia_id');
  const capturaVigencia = params.get('vigencia');
  const [censos, setCensos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [vigencia, setVigencia] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [form, setForm] = useState(() => emptyForm());
  const [personaMode, setPersonaMode] = useState('nueva');
  const [usuario, setUsuario] = useState('');
  const [editando, setEditando] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [captureProgress, setCaptureProgress] = useState(null);

  useEffect(() => {
    Promise.all(['/censo/', '/persona/', '/familia/', '/censo_actividad/'].map((path) => apiJson(path)))
      .then(([records, people, families, assignments]) => {
        setCensos(records);
        setPersonas(people);
        setFamilias(families);
        setAsignaciones(assignments);
      }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    apiJson('/auth/me/').then((profile) => setUsuario(profile.username || profile.email || '')).catch(() => {});
  }, []);

  useEffect(() => {
    if (!captura || loading) return undefined;
    let active = true;
    apiJson(`/familia/${capturaFamiliaId}/progreso/?vigencia=${encodeURIComponent(capturaVigencia)}`)
      .then((progress) => {
        if (!active) return;
        if (progress.integrantes_previstos == null) {
          setError('Esta familia no tiene una meta de integrantes para la vigencia indicada.');
          return;
        }
        setCaptureProgress(progress);
        if (progress.completo) {
          navigate(`/familias/${capturaFamiliaId}`, { replace: true });
          return;
        }
        setForm({ ...emptyForm(usuario), vigencia: capturaVigencia,
          personaData: { ...EMPTY_PERSONA, usuario, familida_id: Number(capturaFamiliaId), integrantes: progress.integrantes_previstos } });
        setPersonaMode('nueva');
        setEditando(null);
        setOpen(true);
      }).catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [captura, capturaFamiliaId, capturaVigencia, loading, navigate, usuario]);

  useEffect(() => {
    if (captura) return;
    const personaId = params.get('persona_id');
    const persona = personas.find((item) => String(item.id) === personaId);
    if (persona) {
      setForm({ ...emptyForm(), persona_id: personaId, personaData: { ...EMPTY_PERSONA, ...persona } });
      setEditando(null);
      setPersonaMode('existente');
      setOpen(true);
    }
  }, [captura, params, personas]);

  const close = () => {
    setOpen(false);
    setFormError('');
    if (captura) {
      navigate(`/familias/${capturaFamiliaId}`);
      return;
    }
    if (params.has('persona_id')) {
      const next = new URLSearchParams(params);
      next.delete('persona_id');
      setParams(next, { replace: true });
    }
  };

  const showForm = (censo = null) => {
    setEditando(censo);
    setForm(censo ? {
      persona_id: String(censo.persona?.id || ''), vigencia: censo.vigencia,
      resguardo_ind: censo.resguardo_ind ?? '', comunidad_ind: censo.comunidad_ind ?? '',
      personaData: { ...EMPTY_PERSONA, ...censo.persona },
    } : emptyForm(usuario));
    setPersonaMode(censo ? 'existente' : 'nueva');
    setFormError('');
    setOpen(true);
  };

  const choosePersona = (personaId) => {
    const persona = personas.find((item) => String(item.id) === personaId);
    setForm((current) => ({
      ...current, persona_id: personaId,
      personaData: persona ? { ...EMPTY_PERSONA, ...persona } : { ...EMPTY_PERSONA, usuario },
    }));
  };

  const changePersonaField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, personaData: { ...current.personaData, [name]: value } }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        vigencia: form.vigencia.trim(),
        resguardo_ind: Number(form.resguardo_ind),
        comunidad_ind: Number(form.comunidad_ind),
      };
      const persona = personaPayload(form.personaData);
      if (editando) {
        payload.persona_data = persona;
      } else if (personaMode === 'existente') {
        payload.persona_id = Number(form.persona_id);
        payload.persona_data = persona;
      } else {
        payload.persona = persona;
      }
      const record = await apiJson(editando ? `/censo/${editando.id}/` : '/censo/', {
        method: editando ? 'PATCH' : 'POST', body: JSON.stringify(payload),
      });
      setPersonas((current) => current.some((item) => item.id === record.persona.id)
        ? current.map((item) => item.id === record.persona.id ? record.persona : item)
        : [...current, record.persona]);
      setCensos((current) => {
        const updated = current.map((item) => {
          if (item.id === record.id) return record;
          return item.persona?.id === record.persona.id ? { ...item, persona: record.persona } : item;
        });
        return editando ? updated : [...updated, record];
      });
      if (captura && !editando) {
        let progress;
        try {
          progress = await apiJson(`/familia/${capturaFamiliaId}/progreso/?vigencia=${encodeURIComponent(capturaVigencia)}`);
        } catch {
          const censados = (captureProgress?.censados || 0) + 1;
          progress = { ...captureProgress, censados, completo: censados >= captureProgress.integrantes_previstos };
        }
        setCaptureProgress(progress);
        if (progress.completo) {
          setOpen(false);
          navigate(`/familias/${capturaFamiliaId}`);
        } else {
          setForm((current) => ({ ...emptyForm(usuario), vigencia: capturaVigencia,
            resguardo_ind: current.resguardo_ind, comunidad_ind: current.comunidad_ind,
            personaData: { ...EMPTY_PERSONA, usuario, familida_id: Number(capturaFamiliaId), integrantes: progress.integrantes_previstos } }));
        }
      } else close();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const descargarReporte = async (formato) => {
    setError('');
    setDownloading(formato);
    try {
      const query = new URLSearchParams({ formato });
      if (vigencia) query.set('vigencia', vigencia);
      const response = await apiFetch(`${API_BASE_URL}/censo/reporte/?${query}`);
      if (!response.ok) throw new Error('No se pudo descargar el reporte del censo.');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `censo_poblacional_${vigencia || 'todas'}.${formato}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDownloading('');
    }
  };

  const filtrados = useMemo(() => censos.filter((censo) => {
    const {persona} = censo;
    const family = familias.find((item) => item.id === persona?.familida_id);
    const matchesText = `${persona?.nombres || ''} ${persona?.apellidos || ''} ${persona?.numero_documento || ''} ${family?.nombre_flia || ''}`.toLowerCase().includes(busqueda.toLowerCase().trim());
    return matchesText && (!vigencia || censo.vigencia === vigencia)
      && matchesAgeRange(persona?.fecha_nacimiento, minAge, maxAge);
  }), [censos, familias, busqueda, vigencia, minAge, maxAge]);
  const pagination = useListPagination(filtrados, JSON.stringify([busqueda, vigencia, minAge, maxAge]));
  let dialogTitle = 'Nuevo censo';
  if (editando) dialogTitle = 'Editar censo';
  if (captura && captureProgress) dialogTitle = `Integrante ${captureProgress.censados + 1} de ${captureProgress.integrantes_previstos}`;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeading title="Censo" subtitle={`${censos.length} registros`} action={!captura && <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => showForm()}>Nuevo censo</Button>} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField size="small" label="Buscar persona o familia" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} sx={{ minWidth: 240, flex: '1 1 240px', maxWidth: 420 }} />
        <TextField select size="small" label="Vigencia" value={vigencia} onChange={(event) => setVigencia(event.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Todas</MenuItem>
          {[...new Set(censos.map((censo) => censo.vigencia))].sort().reverse().map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
        <AgeRangeFilter minAge={minAge} maxAge={maxAge} onMinAgeChange={setMinAge} onMaxAgeChange={setMaxAge} />
        <Button variant="outlined" startIcon={<Iconify icon="eva:download-outline" />} disabled={!!downloading} onClick={() => descargarReporte('pdf')}>PDF general</Button>
        <Button variant="outlined" startIcon={<Iconify icon="eva:download-outline" />} disabled={!!downloading} onClick={() => descargarReporte('xlsx')}>Excel general</Button>
      </Box>
      {loading ? <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box> : <>
        <TableContainer sx={{ borderTop: 1, borderColor: 'divider', overflowX: 'auto' }}>
          <Table size="small" aria-label="Censos">
            <TableHead><TableRow><TableCell>Persona</TableCell><TableCell>Edad</TableCell><TableCell>Familia</TableCell><TableCell>Vigencia</TableCell><TableCell>Actividades</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
            <TableBody>
              {pagination.items.map((censo) => {
                const family = familias.find((item) => item.id === censo.persona?.familida_id);
                const tasks = asignaciones.filter((item) => item.censo === censo.id);
                const status = tasks.some((item) => item.estado !== 'T') ? 'bloqueado' : 'habilitado';
                return <TableRow key={censo.id} hover>
                  <TableCell sx={{ minWidth: 175 }}><Typography variant="body2" fontWeight={600}>{censo.persona?.nombres} {censo.persona?.apellidos}</Typography><Typography variant="caption" color="text.secondary">{censo.persona?.tipo_documento} {censo.persona?.numero_documento}</Typography></TableCell>
                  <TableCell>{ageFromBirthDate(censo.persona?.fecha_nacimiento) ?? '-'}</TableCell>
                  <TableCell>{family ? <Link component={RouterLink} to={`/familias/${family.id}`}>{family.nombre_flia}</Link> : '-'}</TableCell>
                  <TableCell>{censo.vigencia}</TableCell>
                  <TableCell><StatusChip status={status} /></TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Ver paz y salvo"><IconButton component={RouterLink} to={`/pdf/${censo.id}`} size="small" aria-label="Ver paz y salvo"><Iconify icon="eva:file-text-outline" /></IconButton></Tooltip>
                    <Tooltip title="Editar censo"><IconButton onClick={() => showForm(censo)} size="small" aria-label="Editar censo"><Iconify icon="eva:edit-2-outline" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>;
              })}
              {!filtrados.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No hay censos que mostrar.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <ListPagination pagination={pagination} />
      </>}
      <Dialog open={open} onClose={close} fullWidth maxWidth="md" scroll="paper">
        <Box component="form" onSubmit={save}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent dividers>
            {editando && <TextField label="ID Censo" value={editando.id} size="small" disabled sx={{ mb: 2, width: 180 }} />}
            {!editando && !captura && <ToggleButtonGroup exclusive size="small" value={personaMode} onChange={(_, value) => {
              if (!value) return;
              setPersonaMode(value);
              if (value === 'nueva') setForm((current) => ({ ...current, persona_id: '', personaData: { ...EMPTY_PERSONA, usuario } }));
            }} sx={{ mb: 2 }}>
              <ToggleButton value="nueva">Persona nueva</ToggleButton>
              <ToggleButton value="existente">Persona registrada</ToggleButton>
            </ToggleButtonGroup>}
            {personaMode === 'existente' && <TextField select required fullWidth size="small" label="Persona" value={form.persona_id} onChange={(event) => choosePersona(event.target.value)} disabled={!!editando} sx={{ mb: 3 }}>
              {personas.map((persona) => <MenuItem key={persona.id} value={String(persona.id)}>{persona.nombres} {persona.apellidos} · {persona.numero_documento}</MenuItem>)}
            </TextField>}
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Datos del censo</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}><TextField fullWidth required size="small" label="Vigencia" value={form.vigencia} disabled={captura} onChange={(event) => setForm({ ...form, vigencia: event.target.value })} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth required size="small" type="number" label="Resguardo Indígena" value={form.resguardo_ind} onChange={(event) => setForm({ ...form, resguardo_ind: event.target.value })} inputProps={{ min: 1 }} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth required size="small" type="number" label="Comunidad Indígena" value={form.comunidad_ind} onChange={(event) => setForm({ ...form, comunidad_ind: event.target.value })} inputProps={{ min: 1 }} /></Grid>
            </Grid>
            <PersonaFields form={form.personaData} onChange={changePersonaField} familias={familias} showFamily showUsuario lockFamily={captura} />
            {formError && <Alert severity="error">{formError}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={close}>Cancelar</Button><Button type="submit" variant="contained" disabled={saving || (personaMode === 'existente' && !form.persona_id) || !familias.length}>Guardar</Button></DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
