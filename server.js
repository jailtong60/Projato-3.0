require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const DOMPurify = require("isomorphic-dompurify");

const app = express();

// Validar ambiente
const validateEnvironment = () => {
    const { EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error("❌ Erro: EMAIL_USER e EMAIL_PASS não configurados no .env");
        process.exit(1);
    }
};

validateEnvironment();

// Configurar transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    pool: {
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 4000,
        rateLimit: 14
    }
});

// Middleware
app.use(cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5500").split(","),
    methods: ["POST"],
    credentials: true
}));

app.use(express.json({ limit: "1kb" }));

// Rate limiting por IP
const RateLimiter = (() => {
    const requests = {};
    const RATE_LIMIT = 5;
    const WINDOW = 60000;
    const CLEANUP_INTERVAL = 5 * 60000;

    setInterval(() => {
        const now = Date.now();
        for (const ip in requests) {
            requests[ip] = requests[ip].filter(ts => now - ts < WINDOW);
            if (requests[ip].length === 0) delete requests[ip];
        }
    }, CLEANUP_INTERVAL);

    return {
        check: (ip) => {
            if (!requests[ip]) requests[ip] = [];
            const now = Date.now();
            requests[ip] = requests[ip].filter(ts => now - ts < WINDOW);

            if (requests[ip].length >= RATE_LIMIT) {
                return false;
            }
            requests[ip].push(now);
            return true;
        }
    };
})();

// Utilitários de validação
const validators = {
    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]{2,}\.[^\s@]{2,}$/;
        return regex.test(String(email).toLowerCase());
    },
    string: (str, min = 1, max = 100) => {
        if (typeof str !== "string") return false;
        const length = str.trim().length;
        return length >= min && length <= max;
    }
};

// Sanitizar dados
const sanitize = (data) => {
    return {
        nome: DOMPurify.sanitize(data.nome, { ALLOWED_TAGS: [] }).trim(),
        email: String(data.email).toLowerCase().trim(),
        mensagem: DOMPurify.sanitize(data.mensagem, { ALLOWED_TAGS: [] }).trim()
    };
};

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Rota de contato
app.post("/contato", async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress;

    try {
        // Rate limiting
        if (!RateLimiter.check(clientIp)) {
            return res.status(429).json({
                erro: "Limite de requisições atingido. Tente novamente em 1 minuto."
            });
        }

        // Validação básica
        if (!req.body || typeof req.body !== "object") {
            return res.status(400).json({
                erro: "Dados inválidos"
            });
        }

        const { nome, email, mensagem } = req.body;

        if (!nome || !email || !mensagem) {
            return res.status(400).json({
                erro: "Preencha todos os campos obrigatórios"
            });
        }

        // Sanitizar dados
        const dados = sanitize({ nome, email, mensagem });

        // Validações detalhadas
        if (!validators.string(dados.nome, 2, 100)) {
            return res.status(400).json({
                erro: "Nome deve ter entre 2 e 100 caracteres"
            });
        }

        if (!validators.email(dados.email)) {
            return res.status(400).json({
                erro: "E-mail inválido"
            });
        }

        if (!validators.string(dados.mensagem, 10, 5000)) {
            return res.status(400).json({
                erro: "Mensagem deve ter entre 10 e 5000 caracteres"
            });
        }

        // Enviar email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: dados.email,
            subject: `📬 Nova mensagem do site - ${dados.nome}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
                        .header { background: linear-gradient(135deg, #00c2ff, #00ffae); padding: 20px; border-radius: 8px 8px 0 0; color: #000; }
                        .content { background: white; padding: 20px; }
                        .field { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #00c2ff; }
                        .footer { background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>📬 Nova Mensagem de Contato</h2>
                        </div>
                        <div class="content">
                            <div class="field">
                                <span class="label">Nome:</span> ${dados.nome}
                            </div>
                            <div class="field">
                                <span class="label">E-mail:</span> <a href="mailto:${dados.email}">${dados.email}</a>
                            </div>
                            <hr>
                            <div class="field">
                                <span class="label">Mensagem:</span>
                                <p>${dados.mensagem.replace(/\n/g, "<br>")}</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Projatto Soluções em Jateamento</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Nome: ${dados.nome}\nE-mail: ${dados.email}\n\nMensagem:\n${dados.mensagem}`
        });

        return res.status(200).json({
            sucesso: true,
            mensagem: "Mensagem enviada com sucesso! Retornaremos em breve."
        });

    } catch (error) {
        console.error("❌ Erro ao enviar email:", error.message);
        res.status(500).json({
            erro: "Erro ao enviar mensagem. Tente novamente mais tarde."
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ erro: "Rota não encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("❌ Erro no servidor:", err);
    res.status(500).json({ erro: "Erro interno do servidor" });
});

// Iniciar servidor
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    console.log(`📧 Email: ${process.env.EMAIL_USER}`);
    console.log(`🔒 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
});