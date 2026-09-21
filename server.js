const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com Banco MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Altere para seu usuário
    password: '',      // Altere para sua senha
    database: 'cef_grecia_d',
    waitForConnections: true,
    connectionLimit: 10
});

// Listar todas as fichas
app.get('/api/fichas', (req, res) => {
    db.query('SELECT * FROM fichas_pre_conselho ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Criar nova ficha
app.post('/api/fichas', (req, res) => {
    const data = req.body;
    const query = `INSERT INTO fichas_pre_conselho 
    (professor, componente, turma, data, panorama_desenvolvimento, panorama_postura, 
     aprendizagem_dificuldades, aprendizagem_frequencia, destaques_positivos, destaques_atencao, 
     encaminhamento_estrategias, encaminhamento_obs, sintese_geral) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        data.professor, data.componente, data.turma, data.data,
        data.panorama_desenvolvimento, data.panorama_postura,
        data.aprendizagem_dificuldades, data.aprendizagem_frequencia,
        data.destaques_positivos, data.destaques_atencao,
        data.encaminhamento_estrategias, data.encaminhamento_obs,
        data.sintese_geral
    ];

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// Assinar como Pedagoga ou Diretora
app.put('/api/fichas/:id/assinar', (req, res) => {
    const { id } = req.params;
    const { papel, nome } = req.body; // papel: 'pedagoga' ou 'diretora'

    let query = '';
    let params = [];

    if (papel === 'pedagoga') {
        query = 'UPDATE fichas_pre_conselho SET assinado_pedagoga = 1, nome_pedagoga = ?, data_assinado_pedagoga = NOW() WHERE id = ?';
        params = [nome, id];
    } else if (papel === 'diretora') {
        query = 'UPDATE fichas_pre_conselho SET assinado_diretora = 1, nome_diretora = ?, data_assinado_diretora = NOW() WHERE id = ?';
        params = [nome, id];
    }

    db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));