function generarHtmlInforme(informe) {
   const logoBase64 = require("../helpers/logoBase64/logoBase64");
  
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />

    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 11px;
        color: #222;
        margin: 0;
      }

      .header {
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        align-items: center;
        border-bottom: 2px solid #0d6efd;
        padding-bottom: 10px;
        margin-bottom: 14px;
      }

      .logo-box {
        display: flex;
        align-items: center;
        gap: 18px;
      }

      .logo-box img {
        width: 125px;
        height: auto;
      }

      .empresa-info {
        font-size: 10.5px;
        line-height: 1.25;
        color: #444;
      }

      .informe-box {
        text-align: right;
      }

      .informe-titulo {
        font-size: 20px;
        font-weight: bold;
        color: #0d6efd;
        margin-bottom: 4px;
      }

      .informe-numero {
        font-size: 14px;
        font-weight: bold;
        color: #222;
      }

      
      .seccion {
        margin-top: 10px;
        border-top: 1px solid #ccc;
        padding-top: 6px;
        page-break-inside: avoid;
      }

      .seccion h3 {
        font-size: 15px;
        color: #0d6efd;
        margin: 0 0 6px 0;
      }

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 14px;
      }

      .campo {
        margin-bottom: 3px;
      }

      .label {
        font-weight: bold;
      }

      .texto-largo {
        border: 1px solid #ddd;
        padding: 6px;
        min-height: 35px;
        max-height: 85px:
        overflow: hidden;
        white-space: pre-wrap;
      }

      .fotos {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .fotos img {
        width: 31%;
        height: 120px;
        object-fit: cover;
        border: 1px solid #ccc;
      }

      .firmas {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-top: 8px;
        page-break-inside: avoid;
      }

      .firma-box {
        max-width: 100%;
        height: 70px;
        object-fit: contain;
        border-bottom: 1px solid #000;
      }

      .firma-box img {
        max-width: 100%;
        height: 100px;
        object-fit: contain;
        border-bottom: 1px solid #000;
      }

      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #cfcfcf;
        padding-top: 6px;
        width: 100%;
        text-align: center;
        font-size: 9px;
        color: #777;
      }

      .footer strong {
        color: #0d6efd;
      }
      
      .footer-left strong {
        color: #0d6efd;
      }

      .heart {
        color: red;
      }

    </style>
  </head>

  <body>

    <div class="header">
      <div class="logo-box">
        <img  class="logo" src="${logoBase64}" alt="Logo" />

        <div class="empresa-info">
          <strong>Ingroup S.R.L.</strong><br>
          María F. González 820 c/ Dr. Molinas<br>
          Teléfonos: (0981) 401 850 / (0981) 542 729<br>
          e-mail: empresaingroup@gmail.com<br>
          Fdo. de la Mora - Paraguay
        </div>
      </div>

      <div class="informe-box">
        <div class="informe-titulo">INFORME DE SERVICIO</div>
        <div class="informe-numero">N° ${informe.numero || ""}</div>
      </div>
    </div>

      

    <div class="seccion">
      <h3>Datos Generales</h3>
      <div class="grid">
        <div class="campo"><span class="label">Cliente:</span> ${informe.cliente || ""}</div>
        <div class="campo"><span class="label">Técnicos:</span> ${(informe.tecnicos || []).join(", ")}</div>
        <div class="campo"><span class="label">Tipo de trabajo:</span> ${informe.tipoTrabajo || ""}</div>
        <div class="campo"><span class="label">Motivo visita:</span> ${informe.motivo || ""}</div>
      </div>
    </div>

    <div class="seccion">
      <h3>Equipo Intervenido</h3>
      <div class="grid">
        <div class="campo"><span class="label">Equipo:</span> ${informe.equipo || ""}</div>
        <div class="campo"><span class="label">Marca:</span> ${informe.marca || ""}</div>
        <div class="campo"><span class="label">Modelo:</span> ${informe.modelo || ""}</div>
        <div class="campo"><span class="label">Nro. Serie:</span> ${informe.serie || ""}</div>
      </div>
    </div>

    <div class="seccion">
      <h3>Fechas y Horarios</h3>
      <div class="grid">
        <div class="campo"><span class="label">Fecha inicio:</span> ${informe.fechaInicio || ""}</div>
        <div class="campo"><span class="label">Fecha fin:</span> ${informe.fechaFin || ""}</div>
        <div class="campo"><span class="label">Hora inicio:</span> ${informe.horaInicio || ""}</div>
        <div class="campo"><span class="label">Hora fin:</span> ${informe.horaFin || ""}</div>
      </div>
    </div>

    <div class="seccion">
      <h3>Trabajo Realizado</h3>
      <div class="texto-largo">${informe.servicio || ""}</div>
    </div>

    <div class="seccion">
      <h3>Observaciones</h3>
      <div class="texto-largo">${informe.obs || ""}</div>
    </div>

    <div class="seccion">
      <h3>Estado Final</h3>
      <div class="grid">
        <div class="campo"><span class="label">Status:</span> ${informe.status || ""}</div>
        <div class="campo"><span class="label">Necesita repuestos:</span> ${informe.repuestos || ""}</div>
        <div class="campo"><span class="label">Presupuesto:</span> ${informe.presupuesto || ""}</div>
        <div class="campo"><span class="label">Recibido por:</span> ${informe.recibido || ""}</div>
      </div>
    </div>

    <div class="seccion">
      <h3>Fotos Antes</h3>
      <div class="fotos">
        ${(informe.fotosAntes || []).map(url => `
          "${url}">`).join("")}
      </div>
    </div>

    <div class="seccion">
      <h3>Fotos Después</h3>
      <div class="fotos">
        ${(informe.fotosDespues || []).map(url => `"${url}">`).join("")}
      </div>
    </div>

    <div class="seccion">
      <h3>Firmas</h3>

      <div class="firmas">
        <div class="firma-box">
          ${informe.firma ? `<img src="${informe.firma}">` : ""}
          <div>Firma Cliente</div>
        </div>

        <div class="firma-box">
          ${informe.firmaT ? `<img src="${informe.firmaT}">` : ""}
          <div>Firma Técnico</div>
        </div>
      </div>
    </div>

    <div class="footer">
          <div class="footer-left">
            Sistema desarrollado con ❤️ por <strong>freeSoft</strong>
            @2026
          </div>

        <div class="footer-right">
            Pagina <span class="pageNumber"></span>
        </div>
      </div>
    </div>

  </body>
  </html>
  `; 
}

module.exports = {generarHtmlInforme};