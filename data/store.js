const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

const INVENTARIO_INICIAL = [
  // Aguardiente colombiano (precios reales discoteca 2026)
  { id: 1,  producto: 'aguardiente_antioqueño',  nombre: 'Aguardiente Antioqueño',        cantidad: 80,  precio: 180000  },
  { id: 2,  producto: 'aguardiente_cristal',     nombre: 'Aguardiente Cristal',           cantidad: 80,  precio: 165000  },
  { id: 3,  producto: 'aguardiente_nectar',      nombre: 'Aguardiente Néctar',            cantidad: 60,  precio: 170000  },
  { id: 4,  producto: 'aguardiente_caldas',      nombre: 'Aguardiente Licorera de Caldas',cantidad: 50,  precio: 175000  },
  // Ron colombiano
  { id: 5,  producto: 'ron_medellin',            nombre: 'Ron Medellín Añejo',            cantidad: 40,  precio: 190000  },
  { id: 6,  producto: 'ron_dictador',            nombre: 'Ron Dictador 20 Años',          cantidad: 20,  precio: 650000  },
  { id: 7,  producto: 'ron_old_medellin',        nombre: 'Ron Old Medellín Extra Añejo',  cantidad: 25,  precio: 280000  },
  // Whisky (muy popular en discotecas colombianas)
  { id: 8,  producto: 'old_parr',                nombre: 'Old Parr 12 Años',              cantidad: 30,  precio: 420000  },
  { id: 9,  producto: 'buchanans',               nombre: "Buchanan's 12",                 cantidad: 30,  precio: 430000  },
  { id: 10, producto: 'black_label',             nombre: 'Johnnie Walker Black',          cantidad: 25,  precio: 400000  },
  { id: 11, producto: 'tres_palos',              nombre: '3 Palos',                       cantidad: 40,  precio: 220000  },
  // Vodka
  { id: 12, producto: 'smirnoff',                nombre: 'Smirnoff',                      cantidad: 35,  precio: 180000  },
  { id: 13, producto: 'absolut',                 nombre: 'Absolut',                       cantidad: 30,  precio: 280000  },
  { id: 14, producto: 'grey_goose',              nombre: 'Grey Goose',                    cantidad: 20,  precio: 550000  },
  // Champagne
  { id: 15, producto: 'moet',                    nombre: 'Moët & Chandon',                cantidad: 15,  precio: 900000  },
  { id: 16, producto: 'veuve',                   nombre: 'Veuve Clicquot',                cantidad: 10,  precio: 1000000 },
  // Cerveza colombiana (sixpack)
  { id: 17, producto: 'club_colombia',           nombre: 'Club Colombia Dorada x6',       cantidad: 100, precio: 60000   },
  { id: 18, producto: 'aguila',                  nombre: 'Águila x6',                     cantidad: 100, precio: 48000   },
  { id: 19, producto: 'poker',                   nombre: 'Poker x6',                      cantidad: 100, precio: 48000   },
  // Tequila
  { id: 20, producto: 'patron',                  nombre: 'Patrón Silver',                 cantidad: 20,  precio: 650000  },
  { id: 21, producto: 'don_julio',               nombre: 'Don Julio 1942',                cantidad: 15,  precio: 1800000 },
  // Otro
  { id: 22, producto: 'otro',                    nombre: 'Otro',                          cantidad: 999, precio: 0       },
];

function leerDB() {
  if (!fs.existsSync(DB_PATH)) {
    const inicial = {
      clientes:   [],
      pedidos:    [],
      entregas:   [],
      facturas:   [],
      inventario: INVENTARIO_INICIAL,
      _ids: { clientes: 1, pedidos: 1, entregas: 1, facturas: 1 },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(inicial, null, 2));
    return inicial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function guardarDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function siguienteId(db, coleccion) {
  const id = db._ids[coleccion];
  db._ids[coleccion]++;
  return id;
}

module.exports = { leerDB, guardarDB, siguienteId };
