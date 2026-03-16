const express = require('express');
const cors    = require('cors');
const app     = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sin origin (ej. herramientas como Postman) y orígenes permitidos
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origen no permitido'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use('/api', require('./routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`212 Club — API corriendo en http://localhost:${PORT}`);
});
