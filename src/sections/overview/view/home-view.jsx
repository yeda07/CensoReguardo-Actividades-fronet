import { Helmet } from 'react-helmet-async';
import { useMemo, useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { buildPopulation } from 'src/utils/population';

import { apiJson } from 'src/config/api';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import StatusChip from 'src/components/operations/status-chip';
import PageHeading from 'src/components/operations/page-heading';
import ListPagination, { useListPagination } from 'src/components/operations/list-pagination';

export default function HomeView() {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(['/familia/', '/persona/', '/censo/', '/actividad/', '/censo_actividad/'].map((path) => apiJson(path)))
      .then(([familias, personas, censos, actividades, asignaciones]) => setData({ familias, personas, censos, actividades, asignaciones }))
      .catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  const population = useMemo(() => data && buildPopulation(data.personas, data.familias, data.censos), [data]);
  const sexChart = useChart({ labels: ['Hombres', 'Mujeres', 'Otro / sin informar'], colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main], legend: { position: 'bottom', horizontalAlign: 'center' } });
  const ageChart = useChart({ xaxis: { categories: ['0-5', '6-17', '18-29', '30-59', '60+'] }, colors: [theme.palette.info.main], plotOptions: { bar: { horizontal: true, barHeight: '50%' } }, legend: { show: false } });
  const progressChart = useChart({ labels: ['Avance'], colors: [theme.palette.success.main], plotOptions: { radialBar: { hollow: { size: '62%' }, dataLabels: { name: { show: true }, value: { show: true, fontSize: '28px' } } } }, legend: { show: false } });

  const pendientes = data?.asignaciones.filter((item) => item.estado !== 'T') || [];
  const vencidas = pendientes.filter((item) => item.estado === 'N');
  const pendientesOrdenadas = [...pendientes].sort((a, b) => {
    const fechaA = data.actividades.find((item) => item.id === a.actividad)?.fecha_limite || '';
    const fechaB = data.actividades.find((item) => item.id === b.actividad)?.fecha_limite || '';
    return fechaA.localeCompare(fechaB);
  });
  const pagination = useListPagination(pendientesOrdenadas, '', [8, 16, 32]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Helmet><title>Dashboard | Censo del resguardo</title></Helmet>
      <PageHeading title="Dashboard" subtitle={`Población y censo · ${population?.year || new Date().getFullYear()}`} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>}
      {data && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              ['Población total', population.total, '/personas', 'eva:people-fill', 'primary'],
              ['Familias registradas', population.families, '/familias', 'eva:home-fill', 'info'],
              ['Hombres', population.hombres, '/personas?grupo=hombres', 'eva:person-fill', 'primary'],
              ['Mujeres', population.mujeres, '/personas?grupo=mujeres', 'eva:person-fill', 'success'],
              ['Otro / sin informar', population.otro, '/personas?grupo=otro', 'eva:question-mark-circle-fill', 'warning'],
              ['Menores de edad', population.menores, '/personas?grupo=menores', 'eva:people-fill', 'info'],
              ['Niños', population.ninos, '/personas?grupo=ninos', 'eva:person-fill', 'info'],
              ['Niñas', population.ninas, '/personas?grupo=ninas', 'eva:person-fill', 'success'],
              ['Adultos mayores (60+)', population.mayores, '/personas?grupo=mayores', 'eva:people-fill', 'warning'],
              ['Con discapacidad', population.discapacidad, '/personas?grupo=discapacidad', 'eva:heart-fill', 'error'],
              [`Nuevos censados en ${population.year}`, population.nuevos, '/personas?grupo=nuevos', 'eva:person-add-fill', 'success'],
              ['Registros pendientes', population.pending, '/familias?pendientes=1', 'eva:clock-fill', 'warning'],
              ['Censo actualizado', population.completionPercent === null ? '—' : `${population.completionPercent} %`, '/personas?grupo=actualizados', 'eva:checkmark-circle-2-fill', 'success'],
            ].map(([label, value, path, icon, color]) => (
              <Grid item xs={6} sm={4} md={3} key={label}>
                <Box component={RouterLink} to={path} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 122, p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textDecoration: 'none', color: 'text.primary', bgcolor: 'background.paper', '&:hover': { borderColor: `${color}.main`, boxShadow: 2 } }}>
                  <Iconify icon={icon} sx={{ color: `${color}.main`, width: 24, height: 24, mb: 1 }} />
                  <Typography variant="h4" sx={{ lineHeight: 1.15 }}>{typeof value === 'number' ? value.toLocaleString('es-CO') : value}</Typography>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3} sx={{ mb: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">Distribución por sexo</Typography>
              <Chart type="donut" series={[population.hombres, population.mujeres, population.otro]} options={sexChart} height={285} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">Edades</Typography>
              <Chart type="bar" series={[{ name: 'Personas', data: population.ageBands.map((band) => band.value) }]} options={ageChart} height={285} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">Censo actualizado</Typography>
              <Typography variant="caption" color="text.secondary">Avance de metas familiares de {population.year}</Typography>
              {population.completionPercent === null ? <Typography sx={{ py: 10 }} color="text.secondary">Sin metas familiares para esta vigencia.</Typography> : <Chart type="radialBar" series={[population.completionPercent]} options={progressChart} height={265} />}
              <Typography variant="caption" color="text.secondary">{population.pending} integrantes pendientes de censar</Typography>
            </Grid>
          </Grid>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ mb: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Actividades · {pendientes.length} por atender, {vencidas.length} no realizadas</Typography>
            <Button component={RouterLink} to="/actividades" size="small">Ver todas</Button>
          </Stack>
          <TableContainer sx={{ borderTop: 1, borderColor: 'divider', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Persona</TableCell><TableCell>Actividad</TableCell><TableCell>Fecha limite</TableCell><TableCell>Estado</TableCell></TableRow></TableHead>
              <TableBody>
                {pagination.items.map((item) => {
                  const censo = data.censos.find((record) => record.id === item.censo);
                  const actividad = data.actividades.find((record) => record.id === item.actividad);
                  return <TableRow key={item.id} hover>
                    <TableCell><Link component={RouterLink} to={`/pdf/${item.censo}`}>{censo?.persona ? `${censo.persona.nombres} ${censo.persona.apellidos}` : 'Sin persona'}</Link></TableCell>
                    <TableCell>{actividad?.descripcion || 'Actividad eliminada'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{actividad?.fecha_limite || '-'}</TableCell>
                    <TableCell><StatusChip status={item.estado} /></TableCell>
                  </TableRow>;
                })}
                {!pendientesOrdenadas.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}>No hay actividades por atender.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
          <ListPagination pagination={pagination} />
        </>
      )}
    </Container>
  );
}
