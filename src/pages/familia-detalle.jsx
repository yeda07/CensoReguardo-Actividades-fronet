import { Helmet } from 'react-helmet-async';

import FamiliaDetalleView from 'src/sections/familias/view/familia-detalle-view';

export default function FamiliaDetallePage() {
  return (
    <>
      <Helmet><title>Integrantes | Censo del resguardo</title></Helmet>
      <FamiliaDetalleView />
    </>
  );
}
