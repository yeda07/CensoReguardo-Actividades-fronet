import { Helmet } from 'react-helmet-async';

import FamiliasView from 'src/sections/familias/view/familias-view';

export default function FamiliasPage() {
  return (
    <>
      <Helmet><title>Familias | Censo del resguardo</title></Helmet>
      <FamiliasView />
    </>
  );
}
