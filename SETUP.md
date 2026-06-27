# Projatto - Setup Completo Premium

## 📋 Visão Geral

Sistema completo de contato com frontend responsivo e backend seguro, pronto para produção.

**Status:** ✅ Nível Premium - Responsivo, Acessível e Seguro

---

## 🚀 Início Rápido

### Opção 1: Script Automático (Windows)
```bash
setup.bat
```

### Opção 2: Instalação Manual
```bash
npm install
npm start
```

---

## ⚙️ Configuração de Ambiente

### 1. Criar arquivo `.env`
Copie o arquivo `.env.example` e renomeie para `.env`:
```bash
cp .env.example .env
```

### 2. Configurar credenciais
Edite o arquivo `.env` com suas informações:

```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
PORT=5500
CORS_ORIGIN=http://localhost:5500
NODE_ENV=development
```

### 3. Gerar Senha de App (Gmail)

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione:
   - **App:** Mail
   - **Device:** Windows Computer (ou seu dispositivo)
3. Copie a senha gerada
4. Cole no arquivo `.env` na variável `EMAIL_PASS`

⚠️ **Importante:** 
- Use sempre "Senha de App", nunca a senha principal da conta
- Nunca faça commit do arquivo `.env` - está no `.gitignore`
- Mantenha as credenciais seguras

---

## 📦 Dependências

| Pacote | Versão | Descrição |
|--------|--------|-----------|
| `express` | ^4.18.2 | Framework web |
| `cors` | ^2.8.5 | Configuração de CORS |
| `nodemailer` | ^6.9.7 | Envio de emails |
| `dotenv` | ^16.3.1 | Variáveis de ambiente |
| `isomorphic-dompurify` | ^2.3.0 | Sanitização de HTML (segurança) |
| `nodemon` | ^3.0.2 | Auto-reload (dev) |

---

## 🔌 Endpoints da API

### POST `/contato`

Recebe dados do formulário de contato

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "mensagem": "Gostaria de informações sobre seus serviços"
}
```

**Response (200 - Sucesso):**
```json
{
  "sucesso": true,
  "mensagem": "Mensagem enviada com sucesso! Retornaremos em breve."
}
```

**Response (400 - Erro de Validação):**
```json
{
  "erro": "Nome deve ter entre 2 e 100 caracteres"
}
```

**Response (429 - Rate Limit Excedido):**
```json
{
  "erro": "Limite de requisições atingido. Tente novamente em 1 minuto."
}
```

### GET `/health`

Verifica status do servidor

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## 🔐 Segurança

### Implementado

✅ **Validação de Entrada**
- Regex avançado para email
- Limites de caracteres
- Tipo de dados verificado

✅ **Sanitização**
- DOMPurify para remover HTML malicioso
- Trim de strings
- Conversão de tipos

✅ **Rate Limiting**
- Máximo 5 requisições por IP por minuto
- Limpeza automática de cache

✅ **CORS**
- Apenas origens autorizadas
- Métodos restritos (POST)

✅ **Timeout**
- Requisições expiram após 8 segundos (cliente)
- Pool de conexões otimizado (servidor)

✅ **Frontend Acessível**
- WCAG 2.1 AA compliant
- Skip links
- ARIA labels
- Validação em tempo real
- Suporte a teclado

---

## 📱 Responsividade

O frontend é 100% responsivo:

- ✅ **Desktop (1920px+)** - Layout full
- ✅ **Tablet (768px-1200px)** - Layout otimizado
- ✅ **Mobile (320px-767px)** - Stack vertical

Todos os elementos se adaptam perfeitamente com media queries.

---

## 🎨 Qualidade de Código

### Frontend
- Semântica HTML5 completa
- CSS modular com variáveis
- JavaScript orientado a objetos
- Validação client-side robusta

### Backend
- Estrutura clara e organizada
- Tratamento de erros completo
- Logging estruturado
- Performance otimizada

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"
```bash
npm install
```

### Erro: "EACCES: permission denied"
```bash
npm install -g npm  # Atualizar npm
```

### Emails não chegam
1. Verifique credenciais em `.env`
2. Confirme a "Senha de App" do Gmail
3. Verifique a pasta de spam
4. Verifique logs do servidor

### Porta já em uso
```bash
# Mude a porta no .env
PORT=5501
```

### CORS Error
1. Verifique `CORS_ORIGIN` em `.env`
2. Certifique-se que a URL do frontend está correta

---

## 📁 Estrutura de Arquivos

```
projatto/
├── index.html              # Página principal
├── politica.html           # Política de privacidade
├── app.js                  # Frontend (formulário)
├── server.js               # Backend (Express)
├── package.json            # Dependências
├── SETUP.md                # Este arquivo
├── .env.example            # Template de env
├── .env                    # Configuração (não commitar)
├── .gitignore              # Arquivos ignorados
├── setup.bat               # Script Windows
├── marge.bat               # Merge script
├── _css3/
│   ├── style.css           # Estilos premium
│   └── politica.css        # Estilos da política
└── _imagens/
    ├── projattoLogo.svg
    ├── iso.svg
    └── ... (outras imagens)
```

---

## 🌐 Deploy (Produção)

### Configuração Necessária

1. **Variáveis de Ambiente:**
   ```env
   NODE_ENV=production
   PORT=80 ou 443
   CORS_ORIGIN=https://www.projatto.com.br
   ```

2. **Certificado SSL:**
   - Configure HTTPS para produção
   - Use Let's Encrypt (gratuito)

3. **Hosting:**
   - Heroku, Railway, Render, AWS, Azure, etc.
   - Certifique-se de que Node.js está disponível

4. **Email:**
   - Gmail recomendado para volumes baixos
   - SendGrid/Mailgun para volumes altos

---

## 📊 Performance

- ⚡ Carregamento otimizado
- 🎨 CSS modular e eficiente
- 🔄 Compressão de imagens
- 📦 Minificação de assets
- 🚀 Cache headers configurados

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador (F12)
2. Logs do servidor
3. Arquivo `.env`
4. Documentação das dependências

---

## ✅ Checklist Final

- [ ] Node.js instalado (`node -v`)
- [ ] npm atualizado (`npm -v`)
- [ ] `.env` configurado com credenciais
- [ ] `npm install` executado
- [ ] Servidor rodando (`npm start`)
- [ ] Testes de email funcionando
- [ ] Frontend responsivo testado
- [ ] Pronto para deploy

---

**Status:** ✅ Pronto para Produção
**Versão:** 2.0 Premium
**Última atualização:** 2026-05-24