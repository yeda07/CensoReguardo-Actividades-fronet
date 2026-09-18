import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import TablePagination from '@mui/material/TablePagination';

const DEFAULT_PAGE_SIZES = [10, 25, 50];

export function useListPagination(items, resetKey = '', pageSizes = DEFAULT_PAGE_SIZES) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSizes[0]);
  const lastPage = Math.max(0, Math.ceil(items.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);

  useEffect(() => setPage(0), [resetKey]);
  useEffect(() => setPage((previous) => Math.min(previous, lastPage)), [lastPage]);

  return {
    items: items.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage),
    count: items.length,
    page: currentPage,
    rowsPerPage,
    pageSizes,
    onPageChange: (_, nextPage) => setPage(nextPage),
    onRowsPerPageChange: (event) => {
      setRowsPerPage(Number(event.target.value));
      setPage(0);
    },
  };
}

export default function ListPagination({ pagination }) {
  if (pagination.count <= pagination.pageSizes[0]) return null;

  return (
    <TablePagination
      component="div"
      count={pagination.count}
      page={pagination.page}
      rowsPerPage={pagination.rowsPerPage}
      rowsPerPageOptions={pagination.pageSizes}
      onPageChange={pagination.onPageChange}
      onRowsPerPageChange={pagination.onRowsPerPageChange}
      labelRowsPerPage="Filas por página:"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      sx={{ '.MuiTablePagination-toolbar': { px: 0, flexWrap: 'wrap', justifyContent: 'flex-end' } }}
    />
  );
}

ListPagination.propTypes = {
  pagination: PropTypes.shape({
    count: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    pageSizes: PropTypes.arrayOf(PropTypes.number).isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func.isRequired,
  }).isRequired,
};
