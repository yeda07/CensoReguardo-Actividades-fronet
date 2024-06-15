import { Helmet } from 'react-helmet-async';

import { CensoView } from 'src/sections/censo/view';

// ----------------------------------------------------------------------

export default function CensoPage() {
    return (
        <>
            <Helmet>
                <title> CENSO </title>
            </Helmet>

            <CensoView />
        </>
    );
}
