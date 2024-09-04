import React, { useState, useEffect } from 'react';

import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

import AppTrafficBySite from '../app-traffic-by-site';

// ----------------------------------------------------------------------

export default function AppView() {
  const [familyData, setFamilyData] = useState({
    id: '',
    numero_familia: '',
    nombre_flia: ''
  });

  const [families, setFamilies] = useState([]);
  const [persons, setPersons] = useState([]);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const response = await fetch('https://censo-backend.onrender.com/familia/');
      const text = await response.text();
      console.log('Response text:', text);
      const data = JSON.parse(text);
      setFamilies(data);
    } catch (error) {
      console.error('Error fetching families:', error);
    }
  };

  const fetchPersons = async (familyId) => {
    try {
      const response = await fetch(`https://censo-backend.onrender.com/persona/?familia_id=${familyId}`);
      const text = await response.text();
      console.log('Persons response text:', text);
      const data = JSON.parse(text);
      setPersons(data);
    } catch (error) {
      console.error('Error fetching persons:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFamilyData({
      ...familyData,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('https://censo-backend.onrender.com/familia/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(familyData)
      });
      if (response.ok) {
        fetchFamilies();
      } else {
        console.error('Error adding family:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding family:', error);
    }
  };

  const handleViewPersons = (familyId) => {
    fetchPersons(familyId);
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Resguardo awa san andres -las vegas -villa union
      </Typography>

      <Grid container spacing={3}>

        <Grid xs={12} md={6} lg={4}>
          <AppTrafficBySite
            title="Redes sociales"
            list={[
              {
                name: 'FaceBook',
                icon: <Iconify icon="eva:facebook-fill" color="#1877F2" width={32} />,
              },
              {
                name: 'Google',
                icon: <Iconify icon="eva:google-fill" color="#DF3E30" width={32} />,
              },
            ]}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Crear Familia
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="ID"
              name="id"
              value={familyData.id}
              onChange={handleChange}
              margin="normal"
              fullWidth
            />
            <TextField
              label="Número de Familia"
              name="numero_familia"
              value={familyData.numero_familia}
              onChange={handleChange}
              margin="normal"
              fullWidth
            />
            <TextField
              label="Nombre de Familia"
              name="nombre_flia"
              value={familyData.nombre_flia}
              onChange={handleChange}
              margin="normal"
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
              Crear Familia
            </Button>
          </form>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Lista de Familias
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Número de Familia</TableCell>
                <TableCell>Nombre de Familia</TableCell>
                <TableCell>Ver Personas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {families.map((family) => (
                <TableRow key={family.id}>
                  <TableCell>{family.id}</TableCell>
                  <TableCell>{family.numero_familia}</TableCell>
                  <TableCell>{family.nombre_flia}</TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => handleViewPersons(family.id)}>
                      Ver Personas
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>

        {persons.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Personas en la Familia
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombres</TableCell>
                  <TableCell>Apellidos</TableCell>
                  <TableCell>Tipo de Documento</TableCell>
                  <TableCell>Número de Documento</TableCell>
                  <TableCell>Fecha de Nacimiento</TableCell>
                  <TableCell>Parentesco</TableCell>
                  <TableCell>Sexo</TableCell>
                  <TableCell>Estado Civil</TableCell>
                  <TableCell>Profesión</TableCell>
                  <TableCell>Escolaridad</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Teléfono</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {persons.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>{person.id}</TableCell>
                    <TableCell>{person.nombres}</TableCell>
                    <TableCell>{person.apellidos}</TableCell>
                    <TableCell>{person.tipo_documento}</TableCell>
                    <TableCell>{person.numero_documento}</TableCell>
                    <TableCell>{person.fecha_nacimiento}</TableCell>
                    <TableCell>{person.parentesco}</TableCell>
                    <TableCell>{person.sexo}</TableCell>
                    <TableCell>{person.estado_civil}</TableCell>
                    <TableCell>{person.profesion}</TableCell>
                    <TableCell>{person.escolaridad}</TableCell>
                    <TableCell>{person.direccion}</TableCell>
                    <TableCell>{person.telefono}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        )}

      </Grid>
    </Container>
  );
}
