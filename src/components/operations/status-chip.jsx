import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';

const STATES = {
  P: { label: 'Pendiente', color: 'warning' },
  E: { label: 'Pendiente', color: 'warning' },
  N: { label: 'No realizada', color: 'error' },
  T: { label: 'Realizada', color: 'success' },
  Pendiente: { label: 'Pendiente', color: 'warning' },
  'En transcurso': { label: 'Pendiente', color: 'warning' },
  'En Transcurso': { label: 'Pendiente', color: 'warning' },
  'No realizada': { label: 'No realizada', color: 'error' },
  Realizada: { label: 'Realizada', color: 'success' },
  Terminada: { label: 'Realizada', color: 'success' },
  habilitado: { label: 'Habilitado', color: 'success' },
  bloqueado: { label: 'Bloqueado', color: 'error' },
};

export default function StatusChip({ status }) {
  const { label, color } = STATES[status] || { label: status, color: 'default' };
  return <Chip size="small" variant="outlined" label={label} color={color} sx={{ minWidth: 96 }} />;
}

StatusChip.propTypes = { status: PropTypes.string.isRequired };
