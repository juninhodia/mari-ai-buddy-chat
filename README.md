# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3e282e67-d8e8-4b90-803b-b878941e7a3f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3e282e67-d8e8-4b90-803b-b878941e7a3f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3e282e67-d8e8-4b90-803b-b878941e7a3f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Mari AI - Chat Interface

Uma interface de chat inteligente para a assistente Mari AI da Naturalys.

## 🚀 Funcionalidades

### ✨ **Formatação de Mensagens**

O chat agora suporta formatação rica para as mensagens do n8n:

#### **Texto em Negrito**
Use `**texto**` para deixar o texto em negrito:
```
Nós temos o **Magnésio Dimalato** disponível em nossa loja.
```
Resultado: Nós temos o **Magnésio Dimalato** disponível em nossa loja.

#### **Exibição de Imagens**
O chat detecta automaticamente URLs de imagem e as exibe:

1. **URLs diretas:**
```
https://exemplo.com/imagem.png
```

2. **Formato Markdown:**
```
![Nome da Imagem](https://exemplo.com/imagem.png)
```

#### **Tipos de imagem suportados:**
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.svg`

#### **Links normais**
Links que não são imagens continuam sendo exibidos como botões clicáveis.

### **Exemplo de mensagem completa do n8n:**
```
Nós temos o **Magnésio Dimalato** disponível em nossa loja. Aqui estão as informações sobre ele:

- **Recomendação de uso**: Ingerir 02 cápsulas ao dia
- **Informação nutricional**: Magnésio 260mg (62% VD)
- **Ingredientes**: Dimagnésio Malato, Estearato de Magnésio

![Magnésio Dimalato](https://odcwroihlqrcnxttbcok.supabase.co/storage/v1/object/public/images/products/xu82sl0tbmf.png)

Se precisar de mais informações, visite nossa loja: https://naturalys.com.br
```

**Resultado no chat:**
- Texto formatado com negritos
- Imagem exibida automaticamente
- Botão clicável para o link da loja

---

## 🛠️ Instalação e Execução

```bash
npm install
npm run dev
```

## 🔗 Configuração

A URL do webhook do n8n está configurada em:
```typescript
// src/components/ChatScreen.tsx
const N8N_WEBHOOK = "https://juninhodiazszsz.app.n8n.cloud/webhook-test/mariAI";
```

## 📱 Tecnologias

- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Supabase (autenticação)

---

**Mari AI** - Assistente inteligente da Naturalys 🌿
