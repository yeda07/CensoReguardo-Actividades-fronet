import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export const EMPTY_PERSONA = {
  nombres: '', apellidos: '', tipo_documento: 'CC', numero_documento: '',
  exp_documento: '', fecha_nacimiento: '', parentesco: 'HI', sexo: '',
  estado_civil: '', profesion: '', escolaridad: 'NI', integrantes: 1,
  discapacidad: '',
  direccion: '', telefono: '', usuario: '', familida_id: '',
};

const DOCUMENTOS = [
  ['CC', 'Cédula de ciudadanía'], ['TI', 'Tarjeta de identidad'],
  ['RC', 'Registro civil'], ['NUIP', 'NUIP'], ['CE', 'Cédula de extranjería'],
];
const PARENTESCOS = [
  ['CF', 'Cabeza de familia'], ['PA', 'Padre'], ['MA', 'Madre'], ['CO', 'Cónyuge'],
  ['HI', 'Hijo(a)'], ['HE', 'Hermano(a)'], ['ES', 'Esposa'], ['YR', 'Yerno'],
  ['NU', 'Nuera'], ['SU', 'Suegro(a)'], ['SO', 'Sobrino(a)'], ['CU', 'Cuñado(a)'],
  ['TI', 'Tío(a)'], ['AB', 'Abuelo(a)'],
];
const ESCOLARIDAD = [
  ['NI', 'Ninguna'], ['PR', 'Primaria'], ['SC', 'Secundaria'], ['UN', 'Universitaria'],
];
const SEXOS = [
  ['F', 'Femenino'], ['M', 'Masculino'], ['O', 'Otro'],
  ['Femenino', 'Femenino (registro anterior)'],
  ['Masculino', 'Masculino (registro anterior)'],
  ['Otro', 'Otro (registro anterior)'],
  ['No especificado', 'No especificado'],
];
const ESTADOS_CIVILES = [
  'Soltero(a)', 'Casado(a)', 'Unión libre', 'Viudo(a)', 'Divorciado(a)', 'No especificado',
];

export function personaPayload(form) {
  return {
    nombres: form.nombres.trim(),
    apellidos: form.apellidos.trim(),
    tipo_documento: form.tipo_documento,
    numero_documento: Number(form.numero_documento),
    exp_documento: form.exp_documento,
    fecha_nacimiento: form.fecha_nacimiento,
    parentesco: form.parentesco,
    sexo: form.sexo,
    estado_civil: form.estado_civil,
    profesion: form.profesion.trim(),
    escolaridad: form.escolaridad,
    discapacidad: form.discapacidad || '',
    integrantes: Number(form.integrantes),
    direccion: form.direccion.trim(),
    telefono: form.telefono.trim(),
    usuario: form.usuario.trim(),
    familida_id: Number(form.familida_id),
  };
}

export default function PersonaFields({ form, onChange, familias, showFamily, showUsuario, lockFamily }) {
  const field = (name, label, props = {}) => (
    <Grid item xs={12} sm={6} key={name}>
      <TextField fullWidth required size="small" name={name} label={label} value={form[name] ?? ''} onChange={onChange} {...props} />
    </Grid>
  );

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>Identificación</Typography>
      <Grid container spacing={2}>
        {field('nombres', 'Nombres')}
        {field('apellidos', 'Apellidos')}
        {field('tipo_documento', 'Tipo de documento', { select: true, children: DOCUMENTOS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) })}
        {field('numero_documento', 'Número de documento', { type: 'number', inputProps: { min: 1 } })}
        {field('exp_documento', 'Expedición documento', { type: 'date', InputLabelProps: { shrink: true } })}
        {field('fecha_nacimiento', 'Fecha de nacimiento', { type: 'date', InputLabelProps: { shrink: true } })}
      </Grid>
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>Familia y formación</Typography>
      <Grid container spacing={2}>
        {field('parentesco', 'Parentesco', { select: true, children: PARENTESCOS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) })}
        {field('sexo', 'Sexo', { select: true, children: SEXOS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) })}
        {field('estado_civil', 'Estado civil', { select: true, children: ESTADOS_CIVILES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>) })}
        {field('escolaridad', 'Escolaridad', { select: true, children: ESCOLARIDAD.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) })}
        {field('discapacidad', 'Discapacidad', { select: true, required: false, children: [<MenuItem key="" value="">No informado</MenuItem>, <MenuItem key="SI" value="SI">Sí</MenuItem>, <MenuItem key="NO" value="NO">No</MenuItem>] })}
        {field('profesion', 'Profesión')}
        {field('integrantes', 'Integrantes familia', { type: 'number', inputProps: { min: 1 } })}
        {showFamily && field('familida_id', 'ID Familia', { select: true, disabled: lockFamily, children: familias.map((familia) => <MenuItem key={familia.id} value={familia.id}>{familia.numero_familia} · {familia.nombre_flia}</MenuItem>) })}
      </Grid>
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>Contacto y registro</Typography>
      <Grid container spacing={2}>
        {field('direccion', 'Dirección')}
        {field('telefono', 'Teléfono')}
        {showUsuario && field('usuario', 'Usuario')}
      </Grid>
    </>
  );
}

PersonaFields.propTypes = {
  form: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  familias: PropTypes.array,
  showFamily: PropTypes.bool,
  showUsuario: PropTypes.bool,
  lockFamily: PropTypes.bool,
};

PersonaFields.defaultProps = {
  familias: [],
  showFamily: false,
  showUsuario: false,
  lockFamily: false,
};
