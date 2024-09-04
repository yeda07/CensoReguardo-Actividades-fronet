import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

export default function PdfPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);

    const [currentDate, setCurrentDate] = useState('');


    useEffect(() => {
        const today = new Date().toLocaleDateString(); // Puedes personalizar el formato según necesites
        setCurrentDate(today);
    }, []);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://censo-backend.onrender.com/censo/${id}`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);

    const handlePrint = () => {
        const printContents = document.getElementById('print-section').innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    };

    if (!data) return <p>Loading...</p>;

    const { persona } = data;

    return (
        <>
            <div id="print-section" style={{ position: 'relative', zIndex: 1, fontFamily: '"Times New Roman", Times, serif', fontSize: '14px' }}>
                <style>
                    {`
                        @media print {
                            body {
                                font-family: "Times New Roman", Times, serif;
                                font-size: 14px;
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
                
                <div style={{ textAlign: 'center', padding: '4px', marginTop: '40px' }}>
                    <p>
                        Yo, ____________________________, Gobernador de Resguardo awa san<br />
                        andres-las vegas-villa union, por medio de la presente certifico que:
                    </p>

                    <p>
                        El(la) Sr.(a) <b>{persona.nombres} {persona.apellidos}</b>, identificado(a) con <b>{persona.tipo_documento} {persona.numero_documento}</b><br />
                        ha cumplido con todas sus obligaciones<br />
                        financieras y/o contractuales con nuestra institu-<br />ción hasta la fecha de emisión de este certificado.
                    </p>

                    <p>
                        Se expide el presente certificado a petición del interesado(a), para los fines que este(a) es-<br />time conveniente.
                    </p>

                    <p>Fecha de emisión: <b>{currentDate}</b></p>

                    <br />
                    <br />
                    <p style={{ marginBottom: '40px', textAlign: 'left', paddingLeft: '20%' }}>
                        Firma: _________________________<br />
                        <b>[Nombre del Emisor del Certificado]</b><br />
                        Gobernador<br />
                        Resguardo awa san andres-las vegas-villa union
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', marginTop: '80px' }}>
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

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
                    <p>Dirección: Resguardo San Andrés - Las Vegas - Villa Unión</p>
                    <p>Email: resguardosandreslvegasvunion@gmail.com</p>
                    <p>Cel. 3209035795 - 3115891932</p>
                </div>
            </div>
            <button type="button" onClick={handlePrint}>Print</button>
        </>
    );
}