// server.js

const express = require('express');

const cors = require('cors'); 

// Importamos as rotas que acabamos de criar no arquivo routes.js
const routes = require('./routes'); 

// Inicializa o Express
const app = express();

// Configura o Express para entender requisições em formato JSON
app.use(express.json());

// Habilita o CORS para todas as rotas
app.use(cors());

// Dizemos ao nosso aplicativo para usar as rotas importadas
// Isso conecta tudo o que fizemos no routes.js ao nosso servidor principal
app.use(routes);

// Define a porta e inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Rotas disponíveis:`);
  console.log(`- GET  /usuarios`);
  console.log(`- GET  /usuarios/:id`);
  console.log(`- POST /cadastro`);
  console.log(`- POST /login`);
});