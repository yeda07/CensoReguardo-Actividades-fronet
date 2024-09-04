import React, { useState, useEffect } from 'react';
import { Bar, XAxis, YAxis, Legend, Tooltip, BarChart, CartesianGrid } from 'recharts';

import { List, Card, Button, TextField, Typography, CardContent } from '@mui/material';

const ActividadComponente = () => {
    const [actividades, setActividades] = useState([]);
    const [actividadEditada, setActividadEditada] = useState('');
    const [fechaEditada, setFechaEditada] = useState('');
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        obtenerActividades();
    }, []);

    const obtenerActividades = async () => {
        try {
            const response = await fetch('https://censo-backend.onrender.com/actividad/');
            if (!response.ok) {
                throw new Error('Error al obtener datos de la API');
            }
            const data = await response.json();
            setActividades(data);
        } catch (error) {
            console.error('Error al obtener datos de la API:', error);
        }
    };

    const eliminarActividad = async (id) => {
        try {
            const response = await fetch(`https://censo-backend.onrender.com/actividad/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Error al eliminar la actividad');
            }
            setActividades(actividades.filter(actividad => actividad.id !== id));
        } catch (error) {
            console.error('Error al eliminar la actividad:', error);
        }
    };

    const actualizarActividad = async (id) => {
        try {
            const response = await fetch(`https://censo-backend.onrender.com/actividad/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ descripcion: actividadEditada, fecha_limite: fechaEditada })
            });
            if (!response.ok) {
                throw new Error('Error al actualizar la actividad');
            }
            const data = await response.json();
            setActividades(actividades.map(actividad => (actividad.id === id ? data : actividad)));
            setEditandoId(null);
            setActividadEditada('');
            setFechaEditada('');
        } catch (error) {
            console.error('Error al actualizar la actividad:', error);
        }
    };

    // Preparar los datos para el gráfico
    const fechasActividades = actividades.map(actividad => actividad.fecha_limite);
    const contarFechas = fechasActividades.reduce((acc, fecha) => {
        acc[fecha] = (acc[fecha] || 0) + 1;
        return acc;
    }, {});

    const data = Object.keys(contarFechas).map(fecha => ({
        fecha,
        actividades: contarFechas[fecha]
    }));

    return (
        <div>
            <h1>Lista de Actividades y Multas</h1>
            <List>
                {actividades.map(actividad => (
                    <Card key={actividad.id} style={{ marginBottom: '10px' }}>
                        <CardContent>
                            {editandoId === actividad.id ? (
                                <>
                                    <TextField
                                        value={actividadEditada}
                                        onChange={(e) => setActividadEditada(e.target.value)}
                                        label="Editar actividad"
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: '10px' }}
                                    />
                                    <TextField
                                        type="date"
                                        value={fechaEditada}
                                        onChange={(e) => setFechaEditada(e.target.value)}
                                        label="Fecha Límite"
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: '10px' }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Typography variant="h6">{actividad.descripcion}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Fecha Límite: {actividad.fecha_limite}
                                    </Typography>
                                </>
                            )}
                            {editandoId === actividad.id ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => actualizarActividad(actividad.id)}
                                    style={{ marginRight: '10px', marginTop: '10px' }}
                                >
                                    Guardar
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        setEditandoId(actividad.id);
                                        setActividadEditada(actividad.descripcion);
                                        setFechaEditada(actividad.fecha_limite);
                                    }}
                                    style={{ marginRight: '10px', marginTop: '10px' }}
                                >
                                    Editar
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => eliminarActividad(actividad.id)}
                                style={{ marginTop: '10px' }}
                            >
                                Eliminar
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </List>
            <div style={{ marginTop: '20px' }}>
                <BarChart width={600} height={300} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actividades" fill="#8884d8" />
                </BarChart>
            </div>
        </div>
    );
};

export default ActividadComponente;
