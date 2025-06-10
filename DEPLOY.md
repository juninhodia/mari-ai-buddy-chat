# Instruções de Deploy - Vercel

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no painel do Vercel:

### 1. VITE_SUPABASE_URL
```
https://ibzqusisllykxnuobvhk.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlienF1c2lzbGx5a3hudW9idmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODE3MzQsImV4cCI6MjA2MzM1NzczNH0._NTd5wF_sCdnxC8VyV365CdM5HkXzLhghSU7Uk48-48
```

## Como Configurar no Vercel

1. Acesse o painel do Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as duas variáveis acima
4. Clique em **Save**

## Em caso de problemas

1. Force um redeploy:
   - Vá em **Deployments**
   - Clique nos três pontos (...) no último deploy
   - Selecione **Redeploy**

2. Verifique os logs de build na aba **Functions** ou **Deployments**

3. Teste localmente primeiro:
   ```bash
   npm run build
   npm run preview
   ```

## Arquivos Importantes para Deploy

- `vercel.json` - Configuração de roteamento SPA
- `public/_redirects` - Fallback para rotas
- `vite.config.ts` - Configuração de build otimizada 