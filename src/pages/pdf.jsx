import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { apiFetch, API_BASE_URL } from 'src/config/api';

import Iconify from 'src/components/iconify';
import StatusChip from 'src/components/operations/status-chip';
import PageHeading from 'src/components/operations/page-heading';
import ListPagination, { useListPagination } from 'src/components/operations/list-pagination';

export default function PdfPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [eligibilidad, setEligibilidad] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [printReady, setPrintReady] = useState(false);
    const printFrame = useRef(null);
    const pendingPagination = useListPagination(eligibilidad?.actividades || []);

    useEffect(() => {
        const today = new Date().toLocaleDateString(); // Puedes personalizar el formato según necesites
        setCurrentDate(today);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const estadoResponse = await apiFetch(`${API_BASE_URL}/censo/${id}/paz-y-salvo/`);
                if (!estadoResponse.ok) throw new Error('No se pudo verificar el paz y salvo');
                const estado = await estadoResponse.json();
                setEligibilidad(estado);
                if (!estado.habilitado) return;

                const response = await apiFetch(`${API_BASE_URL}/censo/${id}/`);
                if (!response.ok) throw new Error('No se pudo cargar el censo');
                const result = await response.json();
                if (!result.persona) throw new Error('El censo no tiene una persona asociada');
                setData(result);
            } catch (error) {
                setErrorMessage(error.message);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (!data || !currentDate || !eligibilidad?.habilitado) return undefined;
        const certificate = document.getElementById('print-section');
        if (!certificate) return undefined;

        let active = true;
        const frame = document.createElement('iframe');
        frame.title = 'Impresión del paz y salvo';
        frame.style.cssText = 'position:fixed;width:794px;height:1123px;left:-10000px;top:0;border:0;pointer-events:none';
        document.body.appendChild(frame);
        const printDocument = frame.contentDocument;
        printDocument.title = '';
        printDocument.documentElement.lang = 'es';
        const copy = certificate.cloneNode(true);
        const printStyles = copy.querySelector('style');
        if (printStyles) printDocument.head.appendChild(printStyles);
        printDocument.body.appendChild(copy);
        Promise.all(Array.from(printDocument.images, (image) => new Promise((resolve) => {
            if (image.complete) resolve();
            else {
                image.addEventListener('load', resolve, { once: true });
                image.addEventListener('error', resolve, { once: true });
            }
        }))).then(() => {
            if (active) {
                printFrame.current = frame;
                setPrintReady(true);
            }
        });

        return () => {
            active = false;
            printFrame.current = null;
            setPrintReady(false);
            frame.remove();
        };
    }, [data, currentDate, eligibilidad?.habilitado]);

    const handlePrint = () => {
        if (!printReady || !printFrame.current?.contentWindow) return;
        printFrame.current.contentWindow.focus();
        printFrame.current.contentWindow.print();
    };

    if (errorMessage) return <Container maxWidth="md" sx={{ py: 3 }}><Alert severity="error" role="alert">{errorMessage}</Alert></Container>;
    if (eligibilidad && !eligibilidad.habilitado) {
        return (
            <Container maxWidth="md" sx={{ py: 3 }}>
                <Button component={RouterLink} to="/censo" startIcon={<Iconify icon="eva:arrow-back-outline" />} sx={{ mb: 2 }}>Censo</Button>
                <PageHeading title="Paz y salvo no disponible" />
                <p>Hay actividades que todavía no están realizadas:</p>
                <Stack spacing={1} sx={{ mb: 3 }}>
                    {pendingPagination.items.map((actividad) => (
                        <Stack key={actividad.id} direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ borderBottom: 1, borderColor: 'divider', py: 1 }}><Typography>{actividad.descripcion}</Typography><StatusChip status={actividad.estado} /></Stack>
                    ))}
                </Stack>
                <ListPagination pagination={pendingPagination} />
                <Button component={RouterLink} to="/actividades" variant="contained">Ver actividades</Button>
            </Container>
        );
    }
    if (!data) return <Container maxWidth="md" sx={{ py: 3 }}>Cargando...</Container>;

    const { persona } = data;

    return (
        <>
            <div id="print-section" style={{ position: 'relative', zIndex: 1, fontFamily: '"Times New Roman", Times, serif', fontSize: '14px' }}>
                <style>
                    {`
                        #print-section .certificate-body p {
                            text-align: justify;
                            text-align-last: left;
                            line-height: 1.5;
                            margin: 0 0 12px;
                        }
                        #print-section .certificate-body .certificate-date {
                            text-align: center;
                            text-align-last: center;
                            margin-top: 18px;
                        }
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #print-section, #print-section * {
                                visibility: visible;
                            }
                            #print-section {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                box-sizing: border-box;
                                padding: 14mm 16mm;
                            }
                            body {
                                font-family: "Times New Roman", Times, serif;
                                font-size: 14px;
                                margin: 0;
                            }
                            #print-section .certificate-signatures,
                            #print-section .certificate-footer {
                                break-inside: avoid;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            td {
                                padding: 2px;
                                margin: 0;
                                text-align: left;
                            }
                            h2 {
                                font-size: 16px;
                                margin: 0;
                            }
                            p {
                                margin: 4px 0;
                                font-size: 14px;
                                text-align: center;
                            }
                        }
                    `}
                </style>
                <img
                    src="/assets/images/avatars/fondo.png"
                    alt="Fondo"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '80%',
                        height: 'auto',
                        transform: 'translate(-50%, -50%)',
                        opacity: 0.3,
                        zIndex: -1
                    }}
                />
                <table border="1" width="100%" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tr>
                        <td><img style={{ width: "80%", height: "auto" }} src="/assets/images/avatars/logoind.jpg" alt="Logo" /></td>
                        <td style={{ textAlign: 'center', padding: '4px' }}>
                            REPÚBLICA DE COLOMBIA
                            <br />DEPARTAMENTO DEL PUTUMAYO
                            <br />
                            MUNICIPIO DE PUERTO CAICEDO <br />
                            RESGUARDO INDÍGENA AWA, SAN ANDRÉS – LAS VEGAS – VILLA UNIÓN
                            <p style={{ margin: '4px 0' }}>
                                Constituido mediante acuerdo número 015 del 30 de junio de 2005 –
                                Incoder Nit: 900110176-4
                            </p>
                        </td>
                        <td><img style={{ width: "80%", height: "auto" }} src="/assets/images/avatars/image1.jpg" alt="Logo" /></td>
                    </tr>
                </table>

                <h2 style={{ textAlign: 'center', margin: '10px 0' }}>CERTIFICADO DE PAZ Y SALVO</h2>

                <div className="certificate-body" style={{ width: '84%', margin: '20px auto 0', padding: '4px' }}>
                    <p>
                        Yo, <b>Bolivar Chapuesgal Pai</b>, Gobernador de Resguardo awa san andres-las vegas-villa union, por medio de la presente certifico que:
                    </p>

                    <p>
                        <b>{persona.nombres} {persona.apellidos}</b>, identificado(a) con <b>{persona.tipo_documento} {persona.numero_documento}</b>, figura en el censo No. <b>{data.id}</b> correspondiente a la vigencia <b>{data.vigencia}</b>.
                    </p>

                    <p>
                        Al revisar las actividades asignadas a este censo, no se registran actividades pendientes ni marcadas como no realizadas. Por ello, a la fecha de expedición, la persona se encuentra a paz y salvo respecto de las actividades asociadas a este registro.
                    </p>
                    <p>
                        Esta constancia se expide a petición de la persona interesada para los fines que estime pertinentes. Su alcance corresponde al censo y a la vigencia indicados.
                    </p>

                    <p className="certificate-date">Fecha de emisión: <b>{currentDate}</b></p>
                </div>
                <div className="certificate-signatures" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', marginTop: '36px' }}>
                    <p>
                        <img src="/assets/images/avatars/firma1.png" alt="Firma Bolívar" style={{ width: '180px', height: 'auto' }} /><br />
                        BOLÍVAR CHAPUESGAL PAI<br />
                        CC: 18.102.524<br />
                        Gobernador central
                    </p>
                    <p>
                        <img src="/assets/images/avatars/firma2.png" alt="Firma Henoc" style={{ width: '180px', height: 'auto' }} /><br />
                        HENOC WILFREDO GONZALEZ<br />
                        CC: 15.571.717<br />
                        Secretario General
                    </p>
                </div>

                <div className="certificate-footer" style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px' }}>
                    <p>Dirección: Resguardo San Andrés - Las Vegas - Villa Unión</p>
                    <p>Email: resguardosandreslvegasvunion@gmail.com</p>
                    <p>Cel. 3209035795 - 3115891932</p>
                </div>
            </div>
            <Button type="button" variant="contained" onClick={handlePrint} disabled={!printReady} startIcon={<Iconify icon="eva:printer-outline" />} sx={{ mt: 2 }}>{printReady ? 'Imprimir' : 'Preparando impresión...'}</Button>
        </>
    );
}
