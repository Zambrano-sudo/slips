require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path'); // Para gerir caminhos de ficheiros

const app = express();

// --- CONFIGURAÇÃO DE LOGIN (Defina no .env ou use estes padrões) ---
const USER_APP = process.env.USER_APP || "admin";
const PASS_APP = process.env.PASS_APP || "12345";

// 1. Configuração de Segurança (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        "script-src-attr": ["'unsafe-inline'"], 
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'", "https://cdnjs.cloudflare.com"], 
      },
    },
  })
);

app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve os ficheiros da pasta public

// 2. Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Banco de Dados conectado!"))
    .catch(err => {
        console.error("❌ Erro na conexão:", err.message);
        process.exit(1);
    });

// 3. Modelo de Dados
const Cadastro = mongoose.model('Cadastro', {
    nome: String,
    data: Date,
    valor: Number,
    nf: String,
    cci: String,
    cce: String,
    description: String,
    criadoEm: { type: Date, default: Date.now }
});

// --- 4. ROTAS DE AUTENTICAÇÃO ---

// Rota principal: Envia para o login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Endpoint de Login
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === USER_APP && pass === PASS_APP) {
        // Retorna um token simples de sucesso
        res.json({ success: true, token: "logado-com-sucesso-2024" });
    } else {
        res.status(401).json({ success: false, erro: "Usuário ou senha inválidos" });
    }
});

// --- 5. ROTAS DA API (PROTEGIDAS) ---

app.get('/api/cadastros', async (req, res) => {
    try {
        const registros = await Cadastro.find().sort({ criadoEm: -1 });
        res.json(registros);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar dados" });
    }
});

app.post('/api/cadastros', async (req, res) => {
    try {
        const novo = await Cadastro.insertMany(req.body);
        res.status(201).json(novo);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao salvar" });
    }
});

app.put('/api/cadastros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const atualizado = await Cadastro.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ mensagem: "Sucesso!", dado: atualizado });
    } catch (err) {
        res.status(400).json({ erro: "Erro ao editar" });
    }
});

app.delete('/api/cadastros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Cadastro.findByIdAndDelete(id);
        res.json({ mensagem: "Excluído!" });
    } catch (err) {
        res.status(400).json({ erro: "Erro ao excluir" });
    }
});

// 6. Start do Servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});