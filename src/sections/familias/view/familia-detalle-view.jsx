import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { matchesAgeRange, ageFromBirthDate } from 'src/utils/age';

import { apiJson } from 'src/config/api';

import Iconify from 'src/components/iconify';
import PageHeading from 'src/components/operations/page-heading';
import AgeRangeFilter from 'src/components/operations/age-range-filter';
import ListPagination, { useListPagination } from 'src/components/operations/list-pagination';

import PersonaFormDialog from './persona-form-dialog';

export default function FamiliaDetalleView() {
  const { id } = useParams();
  const [familia, setFamilia] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [censos, setCensos] = useState([]);
  const [usuario, setUsuario] = useState('Registro web');
  const [editando, setEditando] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [progresos, setProgresos] = useState([]);

  useEffect(() => {
    Promise.all([
      apiJson(`/familia/${id}/`),
      apiJson(`/persona/?familia_id=${id}`),
      apiJson('/censo/'),
      apiJson('/auth/me/').catch(() => null),
    ]).then(([family, people, records, account]) => {
      setFamilia(family);
      setPersonas(people);
      setCensos(records);
      if (account?.username) setUsuario(account.username);
      return Promise.all((family.metas_censo || []).map((meta) =>
        apiJson(`/familia/${id}/progreso/?vigencia=${encodeURIComponent(meta.vigencia)}`)
      )).then(setProgresos);
    }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [id]);

  const openPerson = (persona = null) => {
    setEditando(persona);
    setDialogOpen(true);
  };

  const onSaved = (persona, record = null) => {
    setPersonas((current) => {
      const exists = current.some((item) => item.id === persona.id);
      return exists ? current.map((item) => item.id === persona.id ? persona : item) : [...current, persona];
    });
    setCensos((current) => record
      ? [...current, record]
      : current.map((censo) => censo.persona?.id === persona.id ? { ...censo, persona } : censo));
    if (record) {
      Promise.all((familia?.metas_censo || []).map((meta) =>
        apiJson(`/familia/${id}/progreso/?vigencia=${encodeURIComponent(meta.vigencia)}`)
      )).then(setProgresos).catch((requestError) => setError(requestError.message));
    }
    setDialogOpen(false);
  };

  const personasFiltradas = personas.filter((persona) => matchesAgeRange(persona.fecha_nacimiento, minAge, maxAge));
  const pagination = useListPagination(personasFiltradas, JSON.stringify([id, minAge, maxAge]));

  if (loading) return <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button component={RouterLink} to="/familias" startIcon={<Iconify icon="eva:arrow-back-outline" />} sx={{ mb: 2 }}>Familias</Button>
      <PageHeading
        title={familia ? familia.nombre_flia : 'Familia'}
        subtitle={familia ? `Familia ${familia.numero_familia} · ${personas.length} integrantes` : ''}
        action={<Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => openPerson()}>Nuevo integrante</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {progresos.map((progreso) => (
        <Box key={progreso.vigencia} sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="body2">Censo {progreso.vigencia}: {progreso.censados} de {progreso.integrantes_previstos} integrantes</Typography>
          {!progreso.completo && <Button component={RouterLink} to={`/censo?captura=1&familia_id=${id}&vigencia=${encodeURIComponent(progreso.vigencia)}`} size="small" variant="outlined" startIcon={<Iconify icon="eva:arrow-forward-outline" />}>Continuar censo</Button>}
        </Box>
      ))}
      <Box sx={{ mb: 2 }}><AgeRangeFilter minAge={minAge} maxAge={maxAge} onMinAgeChange={setMinAge} onMaxAgeChange={setMaxAge} /></Box>
      <TableContainer sx={{ borderTop: 1, borderColor: 'divider', overflowX: 'auto' }}>
        <Table size="small" aria-label="Integrantes de la familia">
          <TableHead><TableRow><TableCell>Integrante</TableCell><TableCell>Edad</TableCell><TableCell>Documento</TableCell><TableCell>Censos</TableCell><TableCell align="right">Acciones</TableCell></TableRow></TableHead>
          <TableBody>
            {pagination.items.map((persona) => {
              const registros = censos.filter((censo) => censo.persona?.id === persona.id);
              return (
                <TableRow key={persona.id} hover>
                  <TableCell sx={{ minWidth: 160 }}><Typography variant="body2" fontWeight={600}>{persona.nombres} {persona.apellidos}</Typography></TableCell>
                  <TableCell>{ageFromBirthDate(persona.fecha_nacimiento) ?? '-'}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{persona.tipo_documento} {persona.numero_documento}</TableCell>
                  <TableCell>{registros.length ? registros.map((censo) => <Link key={censo.id} component={RouterLink} to={`/pdf/${censo.id}`} sx={{ mr: 1 }}>{censo.vigencia}</Link>) : 'Sin censo'}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" justifyContent="flex-end">
                      <Tooltip title="Registrar censo"><IconButton size="small" component={RouterLink} to={`/censo?persona_id=${persona.id}`} aria-label={`Registrar censo de ${persona.nombres}`}><Iconify icon="eva:file-add-outline" /></IconButton></Tooltip>
                      <Tooltip title="Editar integrante"><IconButton size="small" onClick={() => openPerson(persona)} aria-label={`Editar ${persona.nombres}`}><Iconify icon="eva:edit-2-outline" /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {!personasFiltradas.length && <TableRow><TableCell colSpan={5}><Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>{personas.length ? 'No hay integrantes en ese rango de edad.' : 'Esta familia no tiene integrantes registrados.'}</Box></TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <ListPagination pagination={pagination} />
      <PersonaFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={onSaved} persona={editando} familiaId={id} registradoPor={usuario} vigenciaSugerida={familia?.metas_censo?.find((meta) => meta.vigencia === String(new Date().getFullYear()))?.vigencia || familia?.metas_censo?.[0]?.vigencia || String(new Date().getFullYear())} />
    </Container>
  );
}
