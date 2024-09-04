
import React, { useState, useEffect } from 'react';

import {
    Box,
    Grid,
    Paper,
    Table,
    Modal,
    Button,
    TableRow,
    MenuItem,
    Container,
    TableBody,
    TableCell,
    TableHead,
    TextField,
    Typography,
    TableContainer,
    TablePagination
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

export default function CensoPage() {
    const [censoData, setCensoData] = useState([]);
    const [filteredCensoData, setFilteredCensoData] = useState([]);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        vigencia: '',
        resguardo_ind: '',
        comunidad_ind: '',
        nombres: '',
        apellidos: '',
        tipo_documento: '',
        numero_documento: '',
        exp_documento: '',
        fecha_nacimiento: '',
        parentesco: '',
        sexo: '',
        estado_civil: '',
        profesion: '',
        escolaridad: '',
        integrantes: '',
        direccion: '',
        telefono: '',
        usuario: '',
        familida_id: '',
        
    });

    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateId, setUpdateId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('https://censo-backend.onrender.com/censo/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setCensoData(data);
                setFilteredCensoData(data);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsUpdating(false);
        setFormData({
            vigencia: '',
            resguardo_ind: '',
            comunidad_ind: '',
            nombres: '',
            apellidos: '',
            tipo_documento: '',
            numero_documento: '',
            exp_documento: '',
            fecha_nacimiento: '',
            parentesco: '',
            sexo: '',
            estado_civil: '',
            profesion: '',
            escolaridad: '',
            integrantes: '',
            direccion: '',
            telefono: '',
            usuario: '',
            familida_id: '',
            
        });
    };

    const handleFilterCensoData = (searchTerm) => {
        const filtered = censoData.filter(censo =>
            censo.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            censo.persona?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCensoData(filtered);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleRedirectpdf = (censo) => {
        router.push(`/pdf/${censo.id}`);

    }



    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddCenso = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const nuevoCenso = {
            vigencia: formData.vigencia,
            resguardo_ind: parseInt(formData.resguardo_ind, 10),
            comunidad_ind: parseInt(formData.comunidad_ind, 10),
            persona: {
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                tipo_documento: formData.tipo_documento,
                numero_documento: parseInt(formData.numero_documento, 10),
                exp_documento: formData.exp_documento,
                fecha_nacimiento: formData.fecha_nacimiento,
                parentesco: formData.parentesco,
                sexo: formData.sexo,
                estado_civil: formData.estado_civil,
                profesion: formData.profesion,
                escolaridad: formData.escolaridad,
                integrantes: parseInt(formData.integrantes, 10),
                direccion: formData.direccion,
                telefono: formData.telefono,
                usuario: formData.usuario,
                familida_id: parseInt(formData.familida_id, 10),
                // Nuevo campo agregado
            }
        };

        fetch('https://censo-backend.onrender.com/censo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nuevoCenso)
        })
            .then(response => response.json())
            .then(data => {
                setCensoData(prevData => [...prevData, data]);
                setFilteredCensoData(prevData => [...prevData, data]);
                handleClose();
            })
            .catch(error => console.error('Error al agregar datos:', error));
    };

    const handleDeleteCensoAndPerson = (personaId, censoId) => {
        const token = localStorage.getItem('token');
        const personaUrl = `https://censo-backend.onrender.com/persona/${personaId}/`;
        const censoUrl = `https://censo-backend.onrender.com/censo/${censoId}/`;

        // First, delete the associated persona
        fetch(personaUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo eliminar la persona');
                }
                // Then, delete the censo
                return fetch(censoUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo eliminar el censo');
                }
                // Update local data after successfully deleting both records
                setCensoData(prevData => prevData.filter(censo => censo.id !== censoId));
                setFilteredCensoData(prevData => prevData.filter(censo => censo.id !== censoId));
            })
            .catch(error => console.error('Error al eliminar el censo y la persona:', error));
    };

    const handleOpenUpdate = (censo) => {
        setFormData({
            vigencia: censo.vigencia,
            resguardo_ind: censo.resguardo_ind,
            comunidad_ind: censo.comunidad_ind,
            nombres: censo.persona?.nombres || '',
            apellidos: censo.persona?.apellidos || '',
            tipo_documento: censo.persona?.tipo_documento || '',
            numero_documento: censo.persona?.numero_documento || '',
            exp_documento: censo.persona?.exp_documento || '',
            fecha_nacimiento: censo.persona?.fecha_nacimiento || '',
            parentesco: censo.persona?.parentesco || '',
            sexo: censo.persona?.sexo || '',
            estado_civil: censo.persona?.estado_civil || '',
            profesion: censo.persona?.profesion || '',
            escolaridad: censo.persona?.escolaridad || '',
            integrantes: censo.persona?.integrantes || '',
            direccion: censo.persona?.direccion || '',
            telefono: censo.persona?.telefono || '',
            usuario: censo.persona?.usuario || '',
            familida_id: censo.persona?.familida_id || ''
        });
        setUpdateId(censo.id);
        setIsUpdating(true);
        handleOpen();
    };

    const handleUpdateCenso = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const censoUrl = `https://censo-backend.onrender.com/censo/${updateId}/`;
        const personaId = censoData.find(censo => censo.id === updateId)?.persona.id;
        const personaUrl = `https://censo-backend.onrender.com/persona/${personaId}/`;

        const updatedCenso = {
            vigencia: formData.vigencia,
            resguardo_ind: parseInt(formData.resguardo_ind, 10),
            comunidad_ind: parseInt(formData.comunidad_ind, 10)
        };

        const updatedPersona = {
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            tipo_documento: formData.tipo_documento,
            numero_documento: parseInt(formData.numero_documento, 10),
            exp_documento: formData.exp_documento,
            fecha_nacimiento: formData.fecha_nacimiento,
            parentesco: formData.parentesco,
            sexo: formData.sexo,
            estado_civil: formData.estado_civil,
            profesion: formData.profesion,
            escolaridad: formData.escolaridad,
            integrantes: parseInt(formData.integrantes, 10),
            direccion: formData.direccion,
            telefono: formData.telefono,
            usuario: formData.usuario,
            familida_id: parseInt(formData.familida_id, 10),
           
        };

        fetch(censoUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedCenso)
        })
            .then(response => response.json())
            .then(updatedCensoData => {
                fetch(personaUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedPersona)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('No se pudo actualizar la persona');
                        }
                        const updatedCensoIndex = censoData.findIndex(censo => censo.id === updateId);
                        if (updatedCensoIndex !== -1) {
                            const updatedCensoArray = [...censoData];
                            updatedCensoArray[updatedCensoIndex] = updatedCensoData;
                            setCensoData(updatedCensoArray);
                            setFilteredCensoData(updatedCensoArray);
                        }
                        handleClose();
                    })
                    .catch(error => console.error('Error al actualizar la persona:', error));
            })
            .catch(error => console.error('Error al actualizar el censo:', error));
    };

    return (
    // Tu JSX aquí

        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Página de Censo
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <TextField
                    label="Buscar"
                    variant="outlined"
                    onChange={(e) => handleFilterCensoData(e.target.value)}
                    fullWidth
                />
            </Box>

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
                sx={{ mb: 2 }}
            >
                Agregar Nuevo
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Vigencia</TableCell>
                            <TableCell>Resguardo Ind</TableCell>
                            <TableCell>Comunidad Ind</TableCell>
                            <TableCell>Nombres</TableCell>
                            <TableCell>Apellidos</TableCell>
                            <TableCell>Tipo Documento</TableCell>
                            <TableCell>Numero Documento</TableCell>
                            <TableCell>Exp Documento</TableCell>
                            <TableCell>Fecha Nacimiento</TableCell>
                            <TableCell>Parentesco</TableCell>
                            <TableCell>Sexo</TableCell>
                            <TableCell>Estado Civil</TableCell>
                            <TableCell>Profesion</TableCell>
                            <TableCell>Escolaridad</TableCell>
                            <TableCell>Integrantes</TableCell>
                            <TableCell>Direccion</TableCell>
                            <TableCell>Telefono</TableCell>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Familia ID</TableCell>
                            <TableCell>PDF</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCensoData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((censo) => (
                                <TableRow key={censo.id}>
                                    <TableCell>{censo.id}</TableCell>
                                    <TableCell>{censo.vigencia}</TableCell>
                                    <TableCell>{censo.resguardo_ind}</TableCell>
                                    <TableCell>{censo.comunidad_ind}</TableCell>
                                    <TableCell>{censo.persona?.nombres}</TableCell>
                                    <TableCell>{censo.persona?.apellidos}</TableCell>
                                    <TableCell>{censo.persona?.tipo_documento}</TableCell>
                                    <TableCell>{censo.persona?.numero_documento}</TableCell>
                                    <TableCell>{censo.persona?.exp_documento}</TableCell>
                                    <TableCell>{censo.persona?.fecha_nacimiento}</TableCell>
                                    <TableCell>{censo.persona?.parentesco}</TableCell>
                                    <TableCell>{censo.persona?.sexo}</TableCell>
                                    <TableCell>{censo.persona?.estado_civil}</TableCell>
                                    <TableCell>{censo.persona?.profesion}</TableCell>
                                    <TableCell>{censo.persona?.escolaridad}</TableCell>
                                    <TableCell>{censo.persona?.integrantes}</TableCell>
                                    <TableCell>{censo.persona?.direccion}</TableCell>
                                    <TableCell>{censo.persona?.telefono}</TableCell>
                                    <TableCell>{censo.persona?.usuario}</TableCell>
                                    <TableCell>{censo.persona?.familida_id}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleRedirectpdf(censo)}
                                        >
                                            generar pdf
                                        </Button>
                                    </TableCell>


                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handleOpenUpdate(censo)}
                                            sx={{ mr: 1 }}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeleteCensoAndPerson(censo.persona.id, censo.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredCensoData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"

            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        maxHeight: '90vh', // Limita la altura máxima del modal
                        overflowY: 'auto'
                    }}
                >
                    <Typography variant="h6" id="modal-title" gutterBottom>
                        {isUpdating ? 'Editar Censo' : 'Agregar Nuevo Censo'}
                    </Typography>
                    <form onSubmit={isUpdating ? handleUpdateCenso : handleAddCenso}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="id"
                                    label="id"
                                    fullWidth
                                    value={formData.id || ''}  // Asegúrate de que el valor no sea undefined
                                    onChange={handleFormChange}
                                    
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Vigencia"
                                    variant="outlined"
                                    name="vigencia"
                                    value={formData.vigencia}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Resguardo Indígena"
                                    variant="outlined"
                                    name="resguardo_ind"
                                    value={formData.resguardo_ind}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Comunidad Indígena"
                                    variant="outlined"
                                    name="comunidad_ind"
                                    value={formData.comunidad_ind}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Nombres"
                                    variant="outlined"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Apellidos"
                                    variant="outlined"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    select
                                    fullWidth
                                    label="Tipo Documento"
                                    variant="outlined"
                                    name="tipo_documento"
                                    value={formData.tipo_documento}
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="CC">Cédula de Ciudadanía</MenuItem>
                                    <MenuItem value="TI">Tarjeta de Identidad</MenuItem>
                                    <MenuItem value="CE">Cédula de Extranjería</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Número Documento"
                                    variant="outlined"
                                    name="numero_documento"
                                    value={formData.numero_documento}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Expedición Documento"
                                    type="date"
                                    variant="outlined"
                                    name="exp_documento"
                                    value={formData.exp_documento}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Fecha Nacimiento"
                                    type="date"
                                    variant="outlined"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleFormChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    select
                                    fullWidth
                                    label="Parentesco"
                                    variant="outlined"
                                    name="parentesco"
                                    value={formData.parentesco}
                                    onChange={handleFormChange}
                                
                                 >
                                <MenuItem value="PA">PADRE</MenuItem>
                                <MenuItem value="MA"> MADRE</MenuItem>
                                <MenuItem value="HI"> HIJO-HIJA</MenuItem>
                                <MenuItem value="YE"> YERNO</MenuItem>
                                <MenuItem value="TI"> TIO</MenuItem>
                                <MenuItem value="HE"> HERMANO-HERMANA</MenuItem>
                                <MenuItem value="AB"> ABUELO O ABUELA</MenuItem>

                            </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    select
                                    fullWidth
                                    label="Sexo"
                                    variant="outlined"
                                    name="sexo"
                                    value={formData.sexo}
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="M">Masculino</MenuItem>
                                    <MenuItem value="F">Femenino</MenuItem>
                                    <MenuItem value="O">Otro</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    select
                                    fullWidth
                                    label="Estado Civil"
                                    variant="outlined"
                                    name="estado_civil"
                                    value={formData.estado_civil}
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="Soltero(a)">Soltero(a)</MenuItem>
                                    <MenuItem value="Casado(a)">Casado(a)</MenuItem>
                                    <MenuItem value="Viudo(a)">Viudo(a)</MenuItem>
                                    <MenuItem value="Divorciado(a)">Divorciado(a)</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Profesión"
                                    variant="outlined"
                                    name="profesion"
                                    value={formData.profesion}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    select
                                    fullWidth
                                    label="Escolaridad"
                                    variant="outlined"
                                    name="escolaridad"
                                    value={formData.escolaridad}
                                    onChange={handleFormChange}
                                  >
                                <MenuItem value="SC">SECUNDARIA</MenuItem>
                                <MenuItem value="PR"> PRIMARIA</MenuItem>
                                <MenuItem value="UN"> UNIVERSIDAD</MenuItem>
                                <MenuItem value="NI"> NINGUNA</MenuItem>
                                
                               </TextField>
                            </Grid>
                           


                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Integrantes Familia"
                                    variant="outlined"
                                    name="integrantes"
                                    value={formData.integrantes}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Dirección"
                                    variant="outlined"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Teléfono"
                                    variant="outlined"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleFormChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    variant="outlined"
                                    onChange={handleFormChange}
                                    name="usuario"
                                    label="Usuario"
                                    value={formData.usuario}
                                    sx={{ mb: 2 }}
                                />

                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    onChange={handleFormChange}
                                    name="familida_id"
                                    label="ID Familia"
                                    type="text"  // Cambia type de number a text temporalmente
                                    value={formData.familida_id || ''}
                                />
                            </Grid>
                          

                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ mr: 2 }}
                            >
                                {isUpdating ? 'Actualizar' : 'Agregar'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleClose}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
        </Container>
    );
}