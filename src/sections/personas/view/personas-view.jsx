import { Helmet } from 'react-helmet-async';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { buildPopulation, filterPopulation } from 'src/utils/population';

import { apiJson } from 'src/config/api';

import PageHeading from 'src/components/operations/page-heading';
import ListPagination, { useListPagination } from 'src/components/operations/list-pagination';

const GROUPS = [
  ['todos', 'Todas las personas'], ['hombres', 'Hombres'], ['mujeres', 'Mujeres'],
  ['otro', 'Otro / sin informar'], ['menores', 'Menores de edad'], ['ninos', 'Niños'],
  ['ninas', 'Niñas'], ['mayores', 'Adultos mayores (60+)'],
  ['discapacidad', 'Personas con discapacidad'], ['nuevos', 'Nuevos este año'],
  ['actualizados', 'Censados este año'],
];

export default function PersonasView() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const group = GROUPS.some(([key]) => key === params.get('grupo')) ? params.get('grupo') : 'todos';

  useEffect(() => {
    Promise.all(['/persona/', '/familia/', '/censo/'].map(apiJson))
      .then(([personas, familias, censos]) => setData({ personas, familias, censos }))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const population = useMemo(() => data && buildPopulation(data.personas, data.familias, data.censos), [data]);
  const familyNames = useMemo(() => new Map((data?.familias || []).map((family) => [family.id, family.nombre_flia])), [data]);
  const filtered = useMemo(() => filterPopulation(population?.people || [], group).filter((person) =>
    `${person.nombres} ${person.apellidos} ${person.numero_documento || ''} ${familyNames.get(person.familida_id) || ''}`
      .toLowerCase().includes(search.trim().toLowerCase())
  ), [population, group, search, familyNames]);
  const pagination = useListPagination(filtered, `${group}:${search}`);
  const disabilityLabel = (value) => ({ SI: 'Sí', NO: 'No' }[value] || 'Sin informar');

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Helmet><title>Personas | Censo del resguardo</title></Helmet>
      <PageHeading title="Personas" subtitle={`${filtered.length} registros`} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField select size="small" label="Grupo" value={group} onChange={(event) => setParams(event.target.value === 'todos' ? {} : { grupo: event.target.value })} sx={{ minWidth: 220 }}>
          {GROUPS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
        </TextField>
        <TextField size="small" label="Buscar persona o familia" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ flex: '1 1 220px', maxWidth: 400 }} />
      </Box>
      {loading ? <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box> : (
        <>
          <TableContainer sx={{ borderTop: 1, borderColor: 'divider' }}>
            <Table size="small" aria-label="Personas">
              <TableHead><TableRow><TableCell>Persona</TableCell><TableCell>Familia</TableCell><TableCell>Edad</TableCell><TableCell>Sexo</TableCell><TableCell>Discapacidad</TableCell><TableCell>Censo actual</TableCell></TableRow></TableHead>
              <TableBody>
                {pagination.items.map((person) => (
                  <TableRow key={person.id} hover>
                    <TableCell>{person.nombres} {person.apellidos}</TableCell>
                    <TableCell><Link component={RouterLink} to={`/familias/${person.familida_id}`}>{familyNames.get(person.familida_id) || 'Sin familia'}</Link></TableCell>
                    <TableCell>{person.age ?? 'Sin dato'}</TableCell>
                    <TableCell>{person.sexo || 'Sin dato'}</TableCell>
                    <TableCell>{disabilityLabel(person.discapacidad)}</TableCell>
                    <TableCell>{person.currentCensusId ? <Link component={RouterLink} to={`/pdf/${person.currentCensusId}`}>Ver censo</Link> : 'Pendiente'}</TableCell>
                  </TableRow>
                ))}
                {!filtered.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No hay personas en este grupo.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
          <ListPagination pagination={pagination} />
        </>
      )}
    </Container>
  );
}
