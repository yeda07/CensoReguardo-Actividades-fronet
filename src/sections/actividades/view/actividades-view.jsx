import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Paper,
  Stack,
  Table,
  Modal,
  Button,
  Select,
  TableRow,
  MenuItem,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  FormGroup,
  Typography,
  FormControl,
  TableContainer
} from '@mui/material';

export default function Actividadesiew() {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
 
  const [open, setOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    descripcion: '',
    fecha_limite: ''
  });

  useEffect(() => {
    fetch('https://censo-backend.onrender.com/persona/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      })
      .then(data => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });

    fetch('https://censo-backend.onrender.com/actividad/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        return response.json();
      })
      .then(data => {
        setActivities(data);
      })
      .catch(error => {
        console.error('Error fetching activities:', error);
      });
  }, []);

  const handleAddActivity = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewActivity({
      descripcion: '',
      fecha_limite: ''
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewActivity({
      ...newActivity,
      [name]: value
    });
  };

  const handleSubmit = () => {
    const requestData = {
      descripcion: newActivity.descripcion,
      fecha_limite: newActivity.fecha_limite
    };

    fetch('https://censo-backend.onrender.com/actividad/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': 'OSHrW1VsL94axZhfmAHwb2C3TYUSL9IxNjbqVSLp2FLaQtmYYj5TU2RXd7JqccZZ'
      },
      body: JSON.stringify(requestData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add activity');
        }
        return response.json();
      })
      .then(data => {
        setActivities(prevActivities => [
          ...prevActivities,
          { id: data.id, descripcion: newActivity.descripcion }
        ]);
        handleClose();
      })
      .catch(error => {
        console.error('Error adding activity:', error);
      });
  };

  const handleFilterUsers = (searchTerm) => {
    const filtered = users.filter(user =>
      user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleAssignActivity = (userId, activityId) => {
    // Aquí puedes implementar la lógica para asignar la actividad al usuario
    console.log(`Assigned activity ${activityId} to user ${userId}`);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Schedule
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button variant="contained" onClick={handleAddActivity}>
          Add Activity
        </Button>
      </Stack>

      <TextField
        label="Filter Users"
        variant="outlined"
        onChange={(e) => handleFilterUsers(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Assign Activity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.nombres}</TableCell>
                    <TableCell>{user.apellidos}</TableCell>
                    <TableCell>
                      <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <Select
                          value=""
                          onChange={(e) => handleAssignActivity(user.id, e.target.value)}
                          displayEmpty
                          inputProps={{ 'aria-label': 'Without label' }}
                        >
                          <MenuItem value="" disabled>Select an activity</MenuItem>
                          {activities.map((activity) => (
                            <MenuItem key={activity.id} value={activity.id}>
                              {activity.descripcion}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...paperStyle, p: 2 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add New Activity
          </Typography>
          <FormGroup sx={{ mt: 2 }}>
            <TextField
              label="Description"
              variant="outlined"
              name="descripcion"
              value={newActivity.descripcion}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Deadline"
              variant="outlined"
              type="date"
              name="fecha_limite"
              value={newActivity.fecha_limite}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 3 }}
            />
          </FormGroup>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </Box>
      </Modal>
    </Container>
  );
}

const paperStyle = {
  position: 'absolute',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};