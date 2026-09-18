import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { matchesAgeRange, ageFromBirthDate } from 'src/utils/age';

import { apiJson } from 'src/config/api';

import Iconify from 'src/components/iconify';
import StatusChip from 'src/components/operations/status-chip';
import PageHeading from 'src/components/operations/page-heading';
import AgeRangeFilter from 'src/components/operations/age-range-filter';
import ListPagination, { useListPagination } from 'src/components/operations/list-pagination';

export default function ActividadesWorkspace() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'catalogo' ? 'catalogo' : 'asignaciones';
  const [censos, setCensos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState(params.get('estado') || '');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [pickerMinAge, setPickerMinAge] = useState('');
  const [pickerMaxAge, setPickerMaxAge] = useState('');
  const [dialog, setDialog] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ descripcion: '', fecha_limite: '', persona: '', censo: '', actividad: '' });
  const [actividadMode, setActividadMode] = useState('existente');
  const [assignOnCreate, setAssignOnCreate] = useState(true);
  const [catalogCreatedId, setCatalogCreatedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    Promise.all(['/censo/', '/persona/', '/actividad/', '/censo_actividad/'].map((path) => apiJson(path)))
      .then(([records, people, catalog, assigned]) => { setCensos(records); setPersonas(people); setActividades(catalog); setAsignaciones(assigned); })
      .catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  const changeTab = (_, value) => {
    const next = new URLSearchParams(params);
    if (value === 'catalogo') next.set('tab', value); else next.delete('tab');
    setParams(next);
  };

  const openDialog = (kind, item = null) => {
    setFormError('');
    setEditando(item);
    setForm(item ? { descripcion: item.descripcion, fecha_limite: item.fecha_limite, persona: '', censo: '', actividad: '' } : { descripcion: '', fecha_limite: '', persona: '', censo: '', actividad: '' });
    setActividadMode(actividades.length ? 'existente' : 'nueva');
    setAssignOnCreate(!item);
    setCatalogCreatedId(null);
    setPickerMinAge('');
    setPickerMaxAge('');
    setDialog(kind);
  };

  const choosePersona = (personaId) => {
    const records = censos.filter((item) => String(item.persona?.id) === String(personaId));
    setForm((current) => ({ ...current, persona: personaId, censo: records.length === 1 ? records[0].id : '' }));
  };

  const changePickerAge = (nextMinAge, nextMaxAge) => {
    setPickerMinAge(nextMinAge);
    setPickerMaxAge(nextMaxAge);
    const selected = personas.find((item) => String(item.id) === String(form.persona));
    if (selected && !matchesAgeRange(selected.fecha_nacimiento, nextMinAge, nextMaxAge)) {
      setForm((current) => ({ ...current, persona: '', censo: '' }));
    }
  };

  const saveCatalog = async (event) => {
    event.preventDefault(); setSaving(true); setFormError('');
    let createdNow = false;
    try {
      let activityId = catalogCreatedId;
      if (!activityId) {
        const activity = await apiJson(editando ? `/actividad/${editando.id}/` : '/actividad/', {
          method: editando ? 'PATCH' : 'POST',
          body: JSON.stringify({ descripcion: form.descripcion.trim(), fecha_limite: form.fecha_limite }),
        });
        setActividades((current) => editando ? current.map((item) => item.id === activity.id ? activity : item) : [...current, activity]);
        activityId = activity.id;
        if (!editando) {
          setCatalogCreatedId(activity.id);
          createdNow = true;
        }
      }
      if (!editando && assignOnCreate) {
        const assignment = await apiJson('/censo_actividad/', {
          method: 'POST', body: JSON.stringify({ censo: Number(form.censo), actividad: activityId }),
        });
        setAsignaciones((current) => [...current, assignment]);
      }
      setDialog('');
    } catch (requestError) {
      setFormError((createdNow || catalogCreatedId) && assignOnCreate
        ? `La actividad se creó, pero no se pudo asignar: ${requestError.message}`
        : requestError.message);
    } finally { setSaving(false); }
  };

  const saveAssignment = async (event) => {
    event.preventDefault(); setSaving(true); setFormError('');
    let createdActivity = false;
    try {
      let activityId = Number(form.actividad);
      if (actividadMode === 'nueva') {
        const activity = await apiJson('/actividad/', {
          method: 'POST',
          body: JSON.stringify({ descripcion: form.descripcion.trim(), fecha_limite: form.fecha_limite }),
        });
        setActividades((current) => [...current, activity]);
        activityId = activity.id;
        createdActivity = true;
        setActividadMode('existente');
        setForm((current) => ({ ...current, actividad: activity.id }));
      }
      const record = await apiJson('/censo_actividad/', { method: 'POST', body: JSON.stringify({ censo: Number(form.censo), actividad: activityId }) });
      setAsignaciones((current) => [...current, record]);
      setDialog('');
    } catch (requestError) {
      setFormError(createdActivity ? `La actividad se creó, pero no se pudo asignar: ${requestError.message}` : requestError.message);
    } finally { setSaving(false); }
  };

  const confirmDone = async () => {
    setSaving(true); setFormError('');
    try {
      const record = await apiJson(`/censo_actividad/${editando.id}/`, { method: 'PATCH', body: JSON.stringify({ estado: 'T' }) });
      setAsignaciones((current) => current.map((item) => item.id === record.id ? record : item));
      setDialog('');
    } catch (requestError) { setFormError(requestError.message); } finally { setSaving(false); }
  };

  const deleteCatalog = async () => {
    setSaving(true); setFormError('');
    try {
      await apiJson(`/actividad/${editando.id}/`, { method: 'DELETE' });
      setActividades((current) => current.filter((item) => item.id !== editando.id));
      setDialog('');
    } catch (requestError) { setFormError(requestError.message); } finally { setSaving(false); }
  };

  const filtradas = useMemo(() => asignaciones.filter((item) => {
    const censo = censos.find((record) => record.id === item.censo);
    const actividad = actividades.find((record) => record.id === item.actividad);
    const text = `${censo?.persona?.nombres || ''} ${censo?.persona?.apellidos || ''} ${actividad?.descripcion || ''}`.toLowerCase();
    return text.includes(busqueda.toLowerCase().trim())
      && (!estado || item.estado === estado || (estado === 'P' && item.estado === 'E'))
      && matchesAgeRange(censo?.persona?.fecha_nacimiento, minAge, maxAge);
  }), [asignaciones, censos, actividades, busqueda, estado, minAge, maxAge]);
  const assignmentPagination = useListPagination(filtradas, JSON.stringify([busqueda, estado, minAge, maxAge]));
  const catalogPagination = useListPagination(actividades);
  const dialogTitles = {
    catalogo: editando ? 'Editar actividad' : 'Nueva actividad',
    asignar: 'Asignar actividad',
    confirmar: 'Confirmar realización',
    eliminar: 'Eliminar actividad',
  };
  const dialogIsForm = dialog === 'catalogo' || dialog === 'asignar';
  const dialogAction = { confirmar: confirmDone, eliminar: deleteCatalog }[dialog];
  const actionLabel = { confirmar: 'Confirmar', eliminar: 'Eliminar', asignar: actividadMode === 'nueva' ? 'Crear y asignar' : 'Asignar', catalogo: !editando && assignOnCreate ? 'Crear y asignar' : 'Guardar' }[dialog] || 'Guardar';
  const censosPersona = censos.filter((item) => String(item.persona?.id) === String(form.persona));
  const personasPorEdad = personas.filter((item) => matchesAgeRange(item.fecha_nacimiento, pickerMinAge, pickerMaxAge));
  const personPicker = <>
    <AgeRangeFilter minAge={pickerMinAge} maxAge={pickerMaxAge} onMinAgeChange={(value) => changePickerAge(value, pickerMaxAge)} onMaxAgeChange={(value) => changePickerAge(pickerMinAge, value)} />
    <TextField select required label="Persona" value={form.persona} onChange={(event) => choosePersona(event.target.value)}>
      {personasPorEdad.map((persona) => {
        const edad = ageFromBirthDate(persona.fecha_nacimiento);
        return <MenuItem key={persona.id} value={persona.id}>{persona.nombres} {persona.apellidos} · {edad === null ? 'Edad sin registrar' : `${edad} años`} · {persona.tipo_documento} {persona.numero_documento}</MenuItem>;
      })}
    </TextField>
    {form.persona && !censosPersona.length && <Alert severity="warning">Esta persona no tiene censo. <Link component={RouterLink} to={`/censo?persona_id=${form.persona}`}>Registrar censo</Link></Alert>}
    {censosPersona.length > 0 && <TextField select required label="Vigencia del censo" value={form.censo} onChange={(event) => setForm({ ...form, censo: event.target.value })}>
      {censosPersona.map((item) => <MenuItem key={item.id} value={item.id}>{item.vigencia}</MenuItem>)}
    </TextField>}
  </>;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeading title="Actividades" subtitle={`${asignaciones.length} asignaciones · ${actividades.length} en catálogo`} action={<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}><Button variant="outlined" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => openDialog('catalogo')}>Nueva actividad</Button><Button variant="contained" startIcon={<Iconify icon="eva:person-add-outline" />} onClick={() => openDialog('asignar')}>Asignar a persona</Button></Box>} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Tabs value={tab} onChange={changeTab} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}><Tab value="asignaciones" label="Asignaciones" /><Tab value="catalogo" label="Catálogo" /></Tabs>
      {loading && <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>}
      {!loading && tab === 'asignaciones' && (
        <>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField size="small" label="Buscar persona o actividad" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} sx={{ flex: '1 1 240px', maxWidth: 420 }} />
            <TextField select size="small" label="Estado" value={estado} onChange={(event) => setEstado(event.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="">Todos</MenuItem><MenuItem value="P">Pendiente</MenuItem><MenuItem value="N">No realizada</MenuItem><MenuItem value="T">Realizada</MenuItem>
            </TextField>
            <AgeRangeFilter minAge={minAge} maxAge={maxAge} onMinAgeChange={setMinAge} onMaxAgeChange={setMaxAge} />
          </Box>
          <TableContainer sx={{ borderTop: 1, borderColor: 'divider', overflowX: 'auto' }}><Table size="small" aria-label="Asignaciones">
            <TableHead><TableRow><TableCell>Persona</TableCell><TableCell>Edad</TableCell><TableCell>Actividad</TableCell><TableCell>Fecha límite</TableCell><TableCell>Estado</TableCell><TableCell>Multa</TableCell><TableCell align="right">Acción</TableCell></TableRow></TableHead>
            <TableBody>
              {assignmentPagination.items.map((item) => {
                const censo = censos.find((record) => record.id === item.censo);
                const actividad = actividades.find((record) => record.id === item.actividad);
                return <TableRow key={item.id} hover>
                  <TableCell sx={{ minWidth: 165 }}><Link component={RouterLink} to={`/pdf/${item.censo}`}>{censo?.persona ? `${censo.persona.nombres} ${censo.persona.apellidos}` : 'Sin persona'}</Link><Typography variant="caption" display="block" color="text.secondary">{censo?.vigencia}</Typography></TableCell>
                  <TableCell>{ageFromBirthDate(censo?.persona?.fecha_nacimiento) ?? '-'}</TableCell>
                  <TableCell sx={{ minWidth: 170 }}>{actividad?.descripcion || 'Actividad eliminada'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{actividad?.fecha_limite || '-'}</TableCell>
                  <TableCell><StatusChip status={item.estado} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.multas?.length ? Number(item.multas[0].monto).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }) : '-'}</TableCell>
                  <TableCell align="right">{item.estado !== 'T' && <Tooltip title="Marcar realizada"><IconButton size="small" color="success" onClick={() => openDialog('confirmar', item)} aria-label="Marcar realizada"><Iconify icon="eva:checkmark-circle-2-outline" /></IconButton></Tooltip>}</TableCell>
                </TableRow>;
              })}
              {!filtradas.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>No hay asignaciones que mostrar.</TableCell></TableRow>}
            </TableBody>
          </Table></TableContainer>
          <ListPagination pagination={assignmentPagination} />
        </>
      )}
      {!loading && tab === 'catalogo' && (
        <>
        <TableContainer sx={{ borderTop: 1, borderColor: 'divider', overflowX: 'auto' }}><Table size="small" aria-label="Catálogo de actividades">
          <TableHead><TableRow><TableCell>Actividad</TableCell><TableCell>Fecha límite</TableCell><TableCell>Asignaciones</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
          <TableBody>
            {catalogPagination.items.map((item) => {
              const count = asignaciones.filter((assignment) => assignment.actividad === item.id).length;
              return <TableRow key={item.id} hover><TableCell sx={{ minWidth: 200 }}>{item.descripcion}</TableCell><TableCell sx={{ whiteSpace: 'nowrap' }}>{item.fecha_limite}</TableCell><TableCell>{count}</TableCell><TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="Editar"><IconButton size="small" onClick={() => openDialog('catalogo', item)} aria-label={`Editar ${item.descripcion}`}><Iconify icon="eva:edit-2-outline" /></IconButton></Tooltip>
                <Tooltip title={count ? 'No se puede eliminar una actividad asignada' : 'Eliminar'}><span><IconButton size="small" color="error" disabled={count > 0} onClick={() => openDialog('eliminar', item)} aria-label={`Eliminar ${item.descripcion}`}><Iconify icon="eva:trash-2-outline" /></IconButton></span></Tooltip>
              </TableCell></TableRow>;
            })}
            {!actividades.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}>No hay actividades en el catálogo.</TableCell></TableRow>}
          </TableBody>
        </Table></TableContainer>
        <ListPagination pagination={catalogPagination} />
        </>
      )}
      <Dialog open={!!dialog} onClose={() => setDialog('')} fullWidth maxWidth="sm">
        <Box component={dialogIsForm ? 'form' : 'div'} onSubmit={dialog === 'catalogo' ? saveCatalog : saveAssignment}>
          <DialogTitle>{dialogTitles[dialog]}</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
            {dialog === 'catalogo' && <>
              <TextField required label="Descripción" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} disabled={!!catalogCreatedId} />
              <TextField required type="date" label="Fecha límite" value={form.fecha_limite} onChange={(event) => setForm({ ...form, fecha_limite: event.target.value })} InputLabelProps={{ shrink: true }} disabled={!!catalogCreatedId} />
              {!editando && <FormControlLabel control={<Checkbox checked={assignOnCreate} onChange={(event) => setAssignOnCreate(event.target.checked)} />} label="Asignar ahora a una persona" />}
              {!editando && assignOnCreate && personPicker}
            </>}
            {dialog === 'asignar' && <>
              {personPicker}
              <ToggleButtonGroup exclusive size="small" value={actividadMode} onChange={(_, value) => { if (value) setActividadMode(value); }}>
                <ToggleButton value="existente">Del catálogo</ToggleButton>
                <ToggleButton value="nueva">Nueva actividad</ToggleButton>
              </ToggleButtonGroup>
              {actividadMode === 'existente' ? <TextField select required label="Actividad" value={form.actividad} onChange={(event) => setForm({ ...form, actividad: event.target.value })}>{actividades.map((item) => <MenuItem key={item.id} value={item.id}>{item.descripcion} · {item.fecha_limite}</MenuItem>)}</TextField> : <>
                <TextField required label="Descripción" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
                <TextField required type="date" label="Fecha límite" value={form.fecha_limite} onChange={(event) => setForm({ ...form, fecha_limite: event.target.value })} InputLabelProps={{ shrink: true }} />
              </>}
            </>}
            {dialog === 'confirmar' && <Typography>La actividad quedará realizada. Si tenía multa, se eliminará.</Typography>}
            {dialog === 'eliminar' && <Typography>¿Eliminar esta actividad del catálogo?</Typography>}
            {formError && <Alert severity="error">{formError}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setDialog('')}>Cancelar</Button><Button type={dialogIsForm ? 'submit' : 'button'} variant="contained" color={dialog === 'eliminar' ? 'error' : 'primary'} disabled={saving || (dialog === 'asignar' && (!form.censo || (actividadMode === 'existente' && !form.actividad))) || (dialog === 'catalogo' && !editando && assignOnCreate && !form.censo)} onClick={dialogAction}>{actionLabel}</Button></DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
