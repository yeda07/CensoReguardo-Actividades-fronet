import { Helmet } from 'react-helmet-async';

import { ActividadesView } from 'src/sections/actividades/view';

// ----------------------------------------------------------------------

export default function ActividadesPage() {
  return (
    <>
      <Helmet>
        <title> Actividades</title>
      </Helmet>

      <ActividadesView />
    </>
  );
}
