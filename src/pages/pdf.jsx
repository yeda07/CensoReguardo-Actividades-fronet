import React from 'react';
import { useParams } from 'react-router-dom';

export default function PdfPage() {
    const { id } = useParams();
    const dataMock = {
        id: 1,
        vigencia: "2334",
        resguardo_ind: 23334,
        comunidad_ind: 3443,
        persona: {
            id: 1,
            nombres: "string",
            apellidos: "string",
            tipo_documento: "CC",
            numero_documento: 2147483647,
            exp_documento: "2024-08-28",
            fecha_nacimiento: "2024-08-28",
            parentesco: "PA",
            sexo: "string",
            estado_civil: "string",
            profesion: "string",
            escolaridad: "SC",
            integrantes: 2147483647,
            direccion: "string",
            telefono: "string",
            usuario: "string",
            familia_id: 1
        },
        documento_pdf: "http://127.0.0.1:8000/media/pdfs/Certificado_paz_y_salvo__2YgBHtB.pdf"
    };

    const handlePrint = () => {
        const printContents = document.getElementById('print-section').innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    };

    return (
        <>
            <div id="print-section">
                <table border="1" width="100%" style={{ width: '100%' }}>
                    <tr>
                        <td><img  style={{width:"100%"}}src="/public/assets/images/avatars/8c04b94e-5f47-4099-91fb-79bc395e878b.jpg" alt="Logo" /></td>
                        <td style={{ textAlign: 'center' }}>
                            REPÚBLICA DE COLOMBIA
                            <br />DEPARTAMENTO DEL PUTUMAYO
                            <br />
                            MUNICIPIO DE PUERTO CAICEDO <br />
                            RESGUARDO INDÍGENA AWA, SAN ANDRÉS – LAS VEGAS – VILLA UNIÓN
                            <p>
                                Constituido mediante acuerdo número 015 del 30 de junio de 2005 –
                                Incoder Nit: 900110176-4
                            </p>
                        </td>
                        <td><img style={{width:"100%"}} src="/public/assets/images/avatars/image1.jpg" alt="Logo" /></td>
                    </tr>
                </table>

                <h2 style={{ textAlign: 'center' }}>CERTIFICADO DE PAZ Y SALVO</h2>
                <br />
                <div style={{ textAlign: 'left' }}>
                    <p>
                        Yo, ____________________________, Gobernador de Resguardo awa san
                        andres-las vegas-villa union, por medio de la presente certifico que:
                    </p>

                    <p>
                        El() Sr.(a) <b>nombre</b>, identificado(a) con
                        <b>[Tipo y número de documento de identificación]</b>, ha cumplido con
                        todas sus obligaciones financieras y/o contractuales con nuestra
                        institución hasta la fecha de emisión de este certificado.
                    </p>

                    <p>
                        Se expide el presente certificado a petición del interesado(a), para los
                        fines que este(a) estime conveniente.
                    </p>

                    <p>Fecha de emisión: <b>[Fecha de emisión del certificado]</b></p>
                    <br />
                    <br />
                    <p>
                        Firma: _________________________<br />
                        <b>[Nombre del Emisor del Certificado]</b><br />
                        Gobernador<br />
                        Resguardo awa san andres-las vegas-villa union
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>
                        _______________________________<br />
                        BOLÍVAR CHAPUESGAL PAI<br />
                        CC: 18.102.524<br />
                        Gobernador central
                    </p>
                    <p>
                        _______________________________<br />
                        HENOC WILFREDO GONZALEZ<br />
                        CC: 15.571.717<br />
                        Secretario General
                    </p>
                </div>
            </div>
            <button type="button" onClick={handlePrint}>Print</button>
        </>
    );
}