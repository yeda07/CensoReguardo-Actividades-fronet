import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { buildPopulation } from 'src/utils/population';

import { apiJson, apiFetch, API_BASE_URL } from 'src/config/api';

import Iconify from 'src/components/iconify';
import PageHeading from 'src/components/operations/page-heading';
import ListPagination, { useListPagination } from 'src/components/operations/list-pagination';

export default function FamiliasView() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [familias, setFamilias] = useState([]);
  const [population, setPopulation] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ numero_familia: '', nombre_flia: '', vigencia: String(new Date().getFullYear()), integrantes_previstos: '' });
  const [reporteVigencia, setReporteVigencia] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    Promise.all(['/familia/', '/persona/', '/censo/'].map(apiJson))
      .then(([families, people, censos]) => {
        setFamilias(families);
        setPopulation(buildPopulation(people, families, censos));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const soloPendientes = params.get('pendientes') === '1';
  const filtradas = useMemo(() => familias.filter((familia) =>
    (!soloPendientes || population?.pendingFamilyIds.includes(familia.id)) &&
    `${familia.numero_familia} ${familia.nombre_flia}`.toLowerCase().includes(busqueda.toLowerCase().trim())
  ), [familias, busqueda, soloPendientes, population]);
  const pagination = useListPagination(filtradas, `${busqueda}:${soloPendientes}`);

  const crearFamilia = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const creada = await apiJson('/familia/', {
        method: 'POST',
        body: JSON.stringify({
          numero_familia: Number(form.numero_familia), nombre_flia: form.nombre_flia.trim(),
          vigencia: form.vigencia.trim(), integrantes_previstos: Number(form.integrantes_previstos),
        }),
      });
      setFamilias((prev) => [...prev, creada]);
      setOpen(false);
      setForm({ numero_familia: '', nombre_flia: '', vigencia: String(new Date().getFullYear()), integrantes_previstos: '' });
      navigate(`/censo?captura=1&familia_id=${creada.id}&vigencia=${encodeURIComponent(form.vigencia.trim())}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const descargarReporte = async (formato) => {
    setError('');
    setDownloading(formato);
    try {
      const query = new URLSearchParams({ formato });
      if (reporteVigencia.trim()) query.set('vigencia', reporteVigencia.trim());
      const response = await apiFetch(`${API_BASE_URL}/familia/reporte/?${query}`);
      if (!response.ok) throw new Error('No se pudo descargar el reporte.');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `familias_${reporteVigencia.trim() || 'todas'}.${formato}`;
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

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeading
        title="Familias"
        subtitle={`${familias.length} registradas`}
        action={<Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => setOpen(true)}>Nueva familia</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <TextField size="small" label="Vigencia del reporte" value={reporteVigencia} onChange={(event) => setReporteVigencia(event.target.value)} sx={{ width: 190 }} />
        <Button variant="outlined" startIcon={<Iconify icon="eva:download-outline" />} disabled={!!downloading} onClick={() => descargarReporte('pdf')}>PDF</Button>
        <Button variant="outlined" startIcon={<Iconify icon="eva:download-outline" />} disabled={!!downloading} onClick={() => descargarReporte('xlsx')}>Excel</Button>
      </Box>
      <TextField
        fullWidth
        size="small"
        label="Buscar por número o nombre"
        value={busqueda}
        onChange={(event) => setBusqueda(event.target.value)}
        sx={{ mb: 2, maxWidth: 420 }}
      />
      <FormControlLabel control={<Switch checked={soloPendientes} onChange={(event) => setParams(event.target.checked ? { pendientes: '1' } : {})} />} label={`Con integrantes pendientes${population ? ` (${population.pendingFamilyIds.length})` : ''}`} sx={{ mb: 2, ml: 1 }} />
      {loading ? <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={28} /></Box> : <>
        <TableContainer sx={{ borderTop: 1, borderColor: 'divider', overflowX: 'auto' }}>
          <Table size="small" aria-label="Familias">
            <TableHead>
              <TableRow>
                <TableCell width={150}>Número</TableCell>
                <TableCell>Familia</TableCell>
                <TableCell align="right" width={70}>Abrir</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagination.items.map((familia) => (
                <TableRow key={familia.id} hover>
                  <TableCell>{familia.numero_familia}</TableCell>
                  <TableCell>
                    <Link component={RouterLink} to={`/familias/${familia.id}`} underline="hover" fontWeight={600}>
                      {familia.nombre_flia}
                    </Link>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver integrantes">
                      <IconButton component={RouterLink} to={`/familias/${familia.id}`} size="small" aria-label={`Ver ${familia.nombre_flia}`}>
                        <Iconify icon="eva:arrow-forward-outline" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtradas.length === 0 && (
                <TableRow><TableCell colSpan={3}><Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No hay familias que mostrar.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <ListPagination pagination={pagination} />
      </>}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={crearFamilia}>
          <DialogTitle>Nueva familia</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
            <TextField required type="number" inputProps={{ min: 1 }} label="Número de familia" value={form.numero_familia} onChange={(event) => setForm({ ...form, numero_familia: event.target.value })} />
            <TextField required label="Nombre de familia" value={form.nombre_flia} onChange={(event) => setForm({ ...form, nombre_flia: event.target.value })} />
            <TextField required label="Vigencia" value={form.vigencia} onChange={(event) => setForm({ ...form, vigencia: event.target.value })} />
            <TextField required type="number" inputProps={{ min: 1 }} label="Integrantes a censar" value={form.integrantes_previstos} onChange={(event) => setForm({ ...form, integrantes_previstos: event.target.value })} />
            {error && <Alert severity="error">{error}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving}>Guardar</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
