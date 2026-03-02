require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// 1. Configuração de Segurança (Helmet) - ATUALIZADA
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        // Adicionamos a cdnjs aqui para permitir o script
        "script-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        "script-src-attr": ["'unsafe-inline'"], 
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        // ADICIONE "https://cdnjs.cloudflare.com" ABAIXO:
        "connect-src": ["'self'", "https://cdnjs.cloudflare.com"], 
      },
    },
  })
);

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

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

// --- 4. ROTAS DA API ---

// Listar todos (GET)
app.get('/api/cadastros', async (req, res) => {
    try {
        const registros = await Cadastro.find().sort({ criadoEm: -1 });
        res.json(registros);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar dados" });
    }
});

// Criar (POST)
app.post('/api/cadastros', async (req, res) => {
    try {
        const novo = await Cadastro.insertMany(req.body);
        res.status(201).json(novo);
    } catch (err) {
        res.status(400).json({ erro: "Erro ao salvar" });
    }
});

// Editar (PUT)
app.put('/api/cadastros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const atualizado = await Cadastro.findByIdAndUpdate(id, req.body, { new: true });
        if (!atualizado) return res.status(404).json({ erro: "Não encontrado" });
        res.json({ mensagem: "Sucesso!", dado: atualizado });
    } catch (err) {
        res.status(400).json({ erro: "Erro ao editar" });
    }
});

// Excluir (DELETE)
app.delete('/api/cadastros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const removido = await Cadastro.findByIdAndDelete(id);
        if (!removido) return res.status(404).json({ erro: "Não encontrado" });
        res.json({ mensagem: "Excluído!" });
    } catch (err) {
        res.status(400).json({ erro: "Erro ao excluir" });
    }
});

// 5. Start
const PORT = process.env.PORT || 10000; // O Render usa 10000 por padrão
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor online na porta ${PORT}`));