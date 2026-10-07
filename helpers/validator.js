const fs = require('node:fs').promises;
const path = require('node:path');

const API_KEY = process.env.ABSTRACT_API_KEY;
const BASE_URL = "https://emailreputation.abstractapi.com/v1/";
const CACHE_FILE_PATH = path.resolve('./cache_correos.json');

let cacheCorreos = {};

async function inicializarCache() {
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
    cacheCorreos = JSON.parse(data);
    console.log(`📦 [Caché] Cargado con éxito (${Object.keys(cacheCorreos).length} correos).`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      cacheCorreos = {};
    }
  }
}

async function guardarCacheEnDisco() {
  try {
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cacheCorreos, null, 2), 'utf-8');
  } catch (error) {
    console.error("❌ [Caché] Error al escribir en disco:", error.message);
  }
}

async function verificarEmailConCache(email) {
  const emailLimpio = email.trim().toLowerCase();
  
  if (cacheCorreos[emailLimpio]) {
    return { email, resultadoFinal: cacheCorreos[emailLimpio].resultadoFinal };
  }

  try {
    const url = `${BASE_URL}?api_key=${API_KEY}&email=${encodeURIComponent(emailLimpio)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error();
    const data = await response.json();

    const esValido = data.is_valid_format.value && data.deliverability === "DELIVERABLE" && !data.is_disposable_email.value;
    const resultado = esValido ? "VÁLIDO" : "INVÁLIDO";

    cacheCorreos[emailLimpio] = { resultadoFinal: resultado };
    return { email, resultadoFinal: resultado };
  } catch (error) {
    return { email, resultadoFinal: "ERROR" };
  }
}

async function validarListaDeEmails(lista) {
  const promesas = lista.map(email => verificarEmailConCache(email));
  const resultados = await Promise.all(promesas);
  await guardarCacheEnDisco();
  return resultados;
}

// 📦 Exportación corregida al final del archivo
module.exports = { 
  inicializarCache, 
  validarListaDeEmails 
};