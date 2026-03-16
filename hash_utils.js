const crypto = require('crypto');

/**
 * Genera un hash SHA-256 a partir de datos + hash anterior.
 */
function generarHash(datos, hashAnterior) {
  const contenido = JSON.stringify(datos) + hashAnterior;
  return crypto.createHash('sha256').update(contenido).digest('hex');
}

/**
 * Verifica la integridad de la cadena de hashes.
 * Cada bloque debe tener hash_anterior === hash_actual del bloque previo.
 */
function verificarCadena(bloques) {
  for (let i = 1; i < bloques.length; i++) {
    const actual   = bloques[i];
    const anterior = bloques[i - 1];
    if (actual.hash_anterior !== anterior.hash_actual) {
      return { valida: false, bloque_roto: actual.id };
    }
  }
  return { valida: true, bloque_roto: null };
}

module.exports = { generarHash, verificarCadena };
