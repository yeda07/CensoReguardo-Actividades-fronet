
import React, { useState, useEffect } from 'react';

import TablePagination from '@mui/material/TablePagination';
import {
  Table, Paper, Button, Dialog, Select, TableRow, MenuItem, TableBody,
  TableCell, TableHead, Container, TextField, Typography, InputLabel,
  DialogTitle, FormControl, DialogActions, DialogContent, TableContainer
} from '@mui/material';

const Actividades = () => {

  const [open, setOpen] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [censoOptions, setCensoOptions] = useState([]);
  const [selectedCenso, setSelectedCenso] = useState('');
  const [actividadOptions, setActividadOptions] = useState([]);
  const [selectedActividad, setSelectedActividad] = useState('');
  const [estado, setEstado] = useState('P');
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [actividadesAsignadas, setActividadesAsignadas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroApellido, setFiltroApellido] = useState('');

  useEffect(() => {
    const fetchCensos = async () => {
      try {
        const response = await fetch('https://censo-backend.onrender.com/censo/');
        if (!response.ok) {
          throw new Error('Error al cargar los censos');
        }
        const data = await response.json();
        const options = data.map(censo => ({
          value: censo.id,
          label: `${censo.persona.nombres} ${censo.persona.apellidos}`,
          personaId: censo.persona.id
        }));
        setCensoOptions(options);
      } catch (error) {
        console.error('Error al cargar los censos:', error);
      }
    };

    const fetchActividades = async () => {
      try {
        const response = await fetch('https://censo-backend.onrender.com/actividad/');
        if (!response.ok) {
          throw new Error('Error al cargar las actividades');
        }
        const data = await response.json();
        const options = data.map(actividad => ({
          value: actividad.id,
          label: `${actividad.descripcion} - Fecha límite: ${actividad.fecha_limite}`
        }));
        setActividadOptions(options);
      } catch (error) {
        console.error('Error al cargar las actividades:', error);
      }
    };

    const fetchActividadesAsignadas = async () => {
      try {
        const response = await fetch('https://censo-backend.onrender.com/censo_actividad/');
        if (!response.ok) {
          throw new Error('Error al cargar las actividades asignadas');
        }
        const data = await response.json();
        const actividadesMapped = await Promise.all(data.map(async (actividad) => {
          const responseCenso = await fetch(`https://censo-backend.onrender.com/censo/${actividad.censo}/`);
          if (!responseCenso.ok) {
            throw new Error('Error al cargar el censo asociado');
          }
          const censoData = await responseCenso.json();

          const responseActividad = await fetch(`https://censo-backend.onrender.com/actividad/${actividad.actividad}/`);
          if (!responseActividad.ok) {
            throw new Error('Error al cargar la actividad');
          }
          const actividadData = await responseActividad.json();

          return {
            id: actividad.id,
            estado: actividad.estado,
            multas: actividad.multas,
            personaNombre: censoData.persona.nombres,
            personaApellido: censoData.persona.apellidos,
            actividadDescripcion: actividadData.descripcion,
            fechaLimite: actividadData.fecha_limite,
            montoMulta: actividad.multas.length > 0 ? actividad.multas[0].monto : '',
            fecha_pago: actividad.fecha_pago // Asegúrate de que fecha_pago esté disponible en tu API
          };
        }));
        setActividadesAsignadas(actividadesMapped);
      } catch (error) {
        console.error('Error al cargar las actividades asignadas:', error);
      }
    };

    fetchCensos();
    fetchActividades();
    fetchActividadesAsignadas();
  }, []);

  const handleCronogramaClick = () => {
    setOpen(true); // Open the assign activity dialog
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCenso('');
    setSelectedActividad('');
    setEstado('P');
    setMonto('');
    setFechaPago('');
  };

  const handleCreateDialogOpen = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
  };

  const handleAsignarActividad = async () => {
    try {
      const response = await fetch('https://censo-backend.onrender.com/censo_actividad/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          censo: selectedCenso,
          actividad: selectedActividad,
          estado,
          multa_monto: monto,
          fecha_pago: fechaPago
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar la actividad');
      }

      const data = await response.json();

      const responseCenso = await fetch(`https://censo-backend.onrender.com/censo/${selectedCenso}/`);
      if (!responseCenso.ok) {
        throw new Error('Error al cargar el censo asociado');
      }
      const censoData = await responseCenso.json();

      const responseActividad = await fetch(`https://censo-backend.onrender.com/actividad/${selectedActividad}/`);
      if (!responseActividad.ok) {
        throw new Error('Error al cargar la actividad');
      }
      const actividadData = await responseActividad.json();

      const nuevaActividad = {
        id: data.id,
        estado: data.estado,
        multas: data.multas,
        personaNombre: censoData.persona.nombres,
        personaApellido: censoData.persona.apellidos,
        actividadDescripcion: actividadData.descripcion,
        fechaLimite: actividadData.fecha_limite,
        montoMulta: data.multas.length > 0 ? data.multas[0].monto : '',
        fecha_pago: data.fecha_pago
      };

      setActividadesAsignadas([...actividadesAsignadas, nuevaActividad]);
      handleClose(); // Cierra el diálogo después de asignar la actividad
    } catch (error) {
      console.error('Error al enviar la actividad:', error);
    }
  };

  const handleCrearActividad = async () => {
    try {
      const response = await fetch('https://censo-backend.onrender.com/actividad/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          descripcion: selectedActividad,
          fecha_limite: fechaPago
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear la actividad');
      }

      handleCreateDialogClose();
    } catch (error) {
      console.error('Error al crear la actividad:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Actividades
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCronogramaClick}
        style={{ marginBottom: '20px' }}
      >
        Asignar Actividad
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateDialogOpen}
        style={{ marginBottom: '20px', marginLeft: '20px' }}
      >
        Crear Actividad
      </Button>
      <TextField
        label="Filtrar por Nombre"
        value={filtroNombre}
        onChange={(e) => setFiltroNombre(e.target.value)}
        style={{ marginBottom: '10px', marginRight: '10px' }}
      />
      <TextField
        label="Filtrar por Apellido"
        value={filtroApellido}
        onChange={(e) => setFiltroApellido(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Actividad</TableCell>
              <TableCell>Fecha Límite</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Multa/Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actividadesAsignadas
              .filter(actividad => {
                const nombreCompleto = `${actividad.personaNombre} ${actividad.personaApellido}`;
                return (
                  nombreCompleto.toLowerCase().includes(filtroNombre.toLowerCase()) &&
                  nombreCompleto.toLowerCase().includes(filtroApellido.toLowerCase())
                );
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((actividad, index) => (
                <TableRow key={index}>
                  <TableCell>{actividad.id}</TableCell>
                  <TableCell>{`${actividad.personaNombre} ${actividad.personaApellido}`}</TableCell>
                  <TableCell>{actividad.actividadDescripcion}</TableCell>
                  <TableCell>{actividad.fechaLimite}</TableCell>
                  <TableCell>{actividad.estado}</TableCell>
                  <TableCell>
                    {actividad.montoMulta !== '' ? actividad.montoMulta : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[7, 10, 15]}
        component="div"
        count={actividadesAsignadas.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Asignar Actividad</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Censo</InputLabel>
            <Select
              value={selectedCenso}
              onChange={(e) => setSelectedCenso(e.target.value)}
            >
              {censoOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Actividad</InputLabel>
            <Select
              value={selectedActividad}
              onChange={(e) => setSelectedActividad(e.target.value)}
            >
              {actividadOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <MenuItem value="P">Pendiente</MenuItem>
              <MenuItem value="E">En proceso</MenuItem>
              <MenuItem value="T">Completado</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Multa/Monto"
            type="text"
            fullWidth
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Fecha de Pago"
            type="date"
            fullWidth
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAsignarActividad} color="primary">
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
        <DialogTitle>Crear Nueva Actividad</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Descripción"
            type="text"
            fullWidth
            value={selectedActividad}
            onChange={(e) => setSelectedActividad(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Fecha Límite"
            type="date"
            fullWidth
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleCrearActividad} color="primary">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Actividades;
