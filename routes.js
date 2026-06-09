// routes.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importamos a configuração do banco de dados (Knex)
const knexConfig = require('./knexfile');
const knex = require('knex');
const db = knex(knexConfig.development);

// Cria o gerenciador de rotas do Express
const router = express.Router();

// Chave secreta para assinar o JWT (a mesma usada no login)
const JWT_SECRET = 'minha_chave_super_secreta_123';

/**
 * ==========================================
 * MIDDLEWARE DE SEGURANÇA (VERIFICAR TOKEN)
 * Esta função será chamada ANTES de acessar as rotas privadas.
 * ==========================================
 */
function verificarToken(req, res, next) {
  // 1. Pega o token de dentro do cabeçalho de 'Authorization' da requisição
  const authHeader = req.headers['authorization'];
  
  // O padrão do cabeçalho é: "Bearer <token>". Então separamos pelo espaço.
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Se não existir nenhum token, bloqueia o acesso
  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  // 3. Verifica se o token é válido e verdadeiro
  jwt.verify(token, JWT_SECRET, (erro, usuarioDecodificado) => {
    if (erro) {
      // Se o token for inválido, falso ou expirado, bloqueia
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }

    // Se o token for válido, salvamos os dados do usuário na requisição
    // e chamamos a função next() para permitir que ele acesse a rota!
    req.usuario = usuarioDecodificado;
    next();
  });
}

/**
 * ==========================================
 * ROTA 1: LISTAR TODOS OS USUÁRIOS (PRIVADA)
 * Método: GET
 * Caminho: /usuarios
 * Observe a adição do 'verificarToken' antes da função principal.
 * ==========================================
 */
router.get('/usuarios', verificarToken, async (req, res) => {
  try {
    const users = await db('users').select('id', 'email');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar usuários.' });
  }
});

/**
 * ==========================================
 * ROTA 2: BUSCAR USUÁRIO ESPECÍFICO (PRIVADA)
 * Método: GET
 * Caminho: /usuarios/:id
 * Observe a adição do 'verificarToken' antes da função principal.
 * ==========================================
 */
router.get('/usuarios/:id', verificarToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await db('users')
      .where({ id: userId })
      .select('id', 'email')
      .first(); 

    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar o usuário.' });
  }
});

/**
 * ==========================================
 * ROTA 3: CADASTRO DE USUÁRIOS (PÚBLICA)
 * Método: POST
 * Caminho: /cadastro
 * ==========================================
 */
router.post('/cadastro', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await db('users').where({ email }).first();
    if (userExists) {
      return res.status(400).json({ erro: 'Este email já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUserId] = await db('users').insert({
      email,
      password: hashedPassword
    });

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: newUserId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno ao cadastrar o usuário.' });
  }
});

/**
 * ==========================================
 * ROTA 4: LOGIN DE USUÁRIOS (PÚBLICA)
 * Método: POST
 * Caminho: /login
 * ==========================================
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db('users').where({ email }).first();

    if (!user) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ mensagem: 'Login realizado com sucesso!', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno ao realizar o login.' });
  }
});

// Exporta as rotas para o server.js
module.exports = router;