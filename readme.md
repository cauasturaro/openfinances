# OpenFinances

Uma dashboard simples para gerenciamento de gastos, desenvolvida com foco em aprendizado de **React**, **shadcn/ui**, **Tailwind CSS**, **Node.js**, **Prisma** e **PostgreSQL**.

O sistema permite registrar transações financeiras (entrada ou saída), categorizá-las, definir o tipo de pagamento e visualizar os dados em um gráfico interativo.

---

## Tecnologias Utilizadas

### Frontend

- React
- Tailwind CSS
- shadcn/ui

### Backend

- Node.js
- Prisma ORM
- PostgreSQL

---

## Funcionalidades

### Transações

- Criar transações (entrada ou saída)
- Listar transações
- Deletar transações

### Categorias

- Criar categorias
- Deletar categorias
- Associar categoria à transação

### Tipos de Pagamento

- Criar tipos de pagamento
- Deletar tipos de pagamento
- Associar tipo de pagamento à transação

### Dashboard

- Visualização gráfica interativa
- Atualização automática após criação ou remoção de dados
- Resumo geral de entradas e saídas em períodos de tempo diferentes

---

# Como Rodar o Projeto

## Pré-requisitos

Instale:

- Node.js (18+ recomendado)
- npm ou yarn
- PostgreSQL
- Git

---

## Configuração do Banco de Dados

Crie o banco no PostgreSQL:

```sql
CREATE DATABASE openfinances;
```

---

## Configuração do Backend

### Acesse a pasta:

```bash
cd backend
```

### Instale as dependências:

```bash
npm install
```

### Crie o arquivo `.env`:

```
FRONTEND_URL="http://localhost:5173"

DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"
PORT=3000

JWT_SECRET="secret-for-bycrypt"
```

Copie os dados do arquivo .env.example e cole dentro da sua .env com as suas informações

---

### Execute as migrations:

```bash
npx prisma migrate dev
```

---

### Inicie o servidor:

```bash
npm run dev
```

Backend rodando em:

```
http://localhost:3000
```

---

## Configuração do Frontend

### Acesse a pasta:

```bash
cd frontend
```

### Instale as dependências:

```bash
npm install
```

### Configure a URL da API no .env (crie um .env aqui também e crie uma variável para o endereço da API)

```
VITE_API_URL="http://localhost:3333"
```

---

### Inicie o projeto no front:

```bash
npm run dev
```

Frontend disponível em:

```
http://localhost:5173
```
