import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function AgeRangeFilter({ minAge, maxAge, onMinAgeChange, onMaxAgeChange }) {
  const invalidRange = minAge !== '' && maxAge !== '' && Number(minAge) > Number(maxAge);

  return (
    <Box sx={{ display: 'flex', gap: 1, flex: '0 1 auto' }}>
      <TextField
        size="small"
        type="number"
        label="Edad desde"
        value={minAge}
        onChange={(event) => onMinAgeChange(event.target.value)}
        inputProps={{ min: 0 }}
        error={invalidRange}
        sx={{ width: 120 }}
      />
      <TextField
        size="small"
        type="number"
        label="Edad hasta"
        value={maxAge}
        onChange={(event) => onMaxAgeChange(event.target.value)}
        inputProps={{ min: 0 }}
        error={invalidRange}
        sx={{ width: 120 }}
      />
    </Box>
  );
}

AgeRangeFilter.propTypes = {
  minAge: PropTypes.string.isRequired,
  maxAge: PropTypes.string.isRequired,
  onMinAgeChange: PropTypes.func.isRequired,
  onMaxAgeChange: PropTypes.func.isRequired,
};
