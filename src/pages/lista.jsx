import { Helmet } from 'react-helmet-async';

import { ListaView } from 'src/sections/lista/view';

// ----------------------------------------------------------------------

export default function ListaPage() {
    return (
        <>
            <Helmet>
                <title> Actividades</title>
            </Helmet>

            <ListaView />
        </>
    );
}
