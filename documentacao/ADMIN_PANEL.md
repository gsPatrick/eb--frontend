# Painel Administrativo — EB Services

Documentação do módulo admin no frontend (`eb--front`).  
Persona principal: **Thalita · Administradora** (`thalita@ebservices.com`).

---

## Visão geral

O painel admin fica sob a rota `/dashboard/*` e usa:

- **Sidebar flutuante** — navegação, logo, card de perfil e logout
- **DashboardLayout** — área de conteúdo sem navbar superior (apenas botão de menu no mobile)
- **Dados mock** — `constants/adminMockData.js` (ainda não conectado à API em produção)
- **Paginação padrão** — hook `usePagination` + componente `Pagination` integrado ao rodapé das listagens

### Stack e padrões

| Item | Detalhe |
|------|---------|
| Framework | Next.js 15 (App Router) |
| Estilo | CSS Modules + design tokens (`styles/variables.css`) |
| Fontes | Montserrat + Poppins |
| Cores | Primary `#082567`, success `#54cc8b`, bg `#FCFCFC` |
| Arquitetura | Atomic Design (atoms → molecules → organisms → templates) |

---

## Sidebar

**Arquivo:** `components/organisms/Sidebar/Sidebar.js`

| Elemento | Função |
|----------|--------|
| Mini header navy | Logo + botão retrair/expandir (persistido em `localStorage`: `eb_sidebar_collapsed`) |
| Links de navegação | Rotas principais do admin |
| Card Thalita | Link para `/dashboard/profile` (hover, sem ícone) |
| Sair | Limpa `eb_token` e `eb_user` e redireciona para `/login` |

### Itens de menu

| Label | Rota | Ícone |
|-------|------|-------|
| Dashboard | `/dashboard` | dashboard |
| Propriedades | `/dashboard/properties` | properties |
| Usuários | `/dashboard/users` | users |
| Ordens | `/dashboard/orders` | orders |
| Serviços Extras | `/dashboard/extras` | extras |
| Financeiro | `/dashboard/billing` | billing |

> A rota `/design-system` ainda existe no projeto, mas **não aparece mais na sidebar**.

---

## Páginas

### 1. Centro de Comando — `/dashboard`

**Arquivo:** `app/dashboard/page.js`  
**Função:** visão operacional e financeira em tempo real.

**Seções:**

| Bloco | O que faz |
|-------|-----------|
| **4 StatCards** | Limpezas hoje, OS em andamento, propriedades ativas, faturamento do mês |
| **Alertas de estoque crítico** | Header full-width + carrossel horizontal (1 item por vez) com itens abaixo do mínimo |
| **Faturamento** | Gráfico de barras com filtros de **mês** e **ano**, valor do período e variação vs mês anterior |
| **Ordens recentes** | Tabela paginada (5/10/15/20 por página) com link para a listagem completa |

**Colunas da tabela:** Propriedade, Prestador, Status, Data, Total.

---

### 2. Gestão de Propriedades — `/dashboard/properties`

**Arquivo:** `app/dashboard/properties/page.js`  
**Função:** gerenciar casas/apartamentos, sync Airbnb e geofence.

**Seções:**

| Bloco | O que faz |
|-------|-----------|
| **PageHeader** | Título + descrição da gestão de propriedades |
| **Grid de cards** | Foto, nome, endereço, badges (ativa/inativa, cliente, GPS) |
| **Ações por card** | Sincronizar Airbnb (iCal), editar Geofence |
| **Modal Geofence** | Formulário latitude/longitude para check-in/out |
| **Paginação** | Rodapé no container da listagem |

**Dados mock:** `MOCK_PROPERTIES` (Copacabana, Ipanema, Leblon).

---

### 3. Gestão de Usuários — `/dashboard/users`

**Arquivo:** `app/dashboard/users/page.js`  
**Função:** controle de acessos e permissões.

**Seções:**

| Bloco | O que faz |
|-------|-----------|
| **PageHeader** | Título + botão "Exportar lista" (UI) |
| **Tabela** | Nome, e-mail, permissão, status, último login, ações |
| **Select de role** | Cliente / Prestador / Administrador (admin bloqueado) |
| **Switch + botão** | Ativar/desativar usuário |
| **Paginação** | Rodapé integrado à tabela |

**Dados mock:** `MOCK_USERS`.

---

### 4. Ordens de Serviço — `/dashboard/orders`

**Arquivo:** `app/dashboard/orders/page.js`  
**Função:** controle operacional de limpezas/OS.

**Seções:**

| Bloco | O que faz |
|-------|-----------|
| **PageHeader** | Título + instrução para clicar na linha |
| **Tabs** | Todas, Pendentes, Em andamento, Concluídas |
| **Tabela** | Prestador (avatar), propriedade, cliente, status, data, total |
| **Modal de detalhe** | Abre ao clicar na linha (fotos antes/depois, GPS, extras) |
| **Paginação** | Reseta ao trocar aba; rodapé na tabela |

**Componente:** `OrderDetailModal` — layout limpo com cards de info, fotos lado a lado e mapas OpenStreetMap.

**Dados mock:** `MOCK_ORDERS` (12 ordens).

---

### 5. Catálogo Serviços Extras — `/dashboard/extras`

**Arquivo:** `app/dashboard/extras/page.js`  
**Função:** CRUD de serviços adicionais e preços.

**Seções:**

| Bloco | O que faz |
|-------|-----------|
| **PageHeader** | Título + botão "Novo serviço" |
| **Tabela** | Serviço, preço, tempo estimado, ações (editar/remover) |
| **Modal** | Criar/editar nome, preço padrão e tempo (min) |
| **Paginação** | Rodapé integrado |

**Dados mock:** `MOCK_EXTRAS` (geladeira, vidros, roupa de cama, forno).

---

### 6. Relatórios Financeiros — `/dashboard/billing`

**Arquivo:** `app/dashboard/billing/page.js`  
**Função:** gerar extratos de cobrança por período.

**Seções:**

| Bloco | O que faz |
|-------|-----------|
| **PageHeader** | Título + descrição |
| **Filtros** | Data início, data fim, cliente (select) |
| **Botão** | "Gerar extrato" (simula loading + toast) |
| **Após gerar** | 3 StatCards (total, ordens, cliente/período) |
| **Tabela detalhada** | Propriedade, prestador, status, concluída em, total |
| **Exportar extrato** | Botão placeholder (toast informando integração futura) |
| **Paginação** | Na tabela do extrato |

**Dados mock:** `MOCK_BILLING_REPORT`, `MOCK_ORDERS` (concluídas).

---

### 7. Perfil — `/dashboard/profile`

**Acesso:** card **Thalita · Administradora** na sidebar (não está no menu principal).

**Arquivo:** `app/dashboard/profile/page.js`  
**Layout:** `ProfileLayout` — split 50/50 (painel navy à esquerda, formulário à direita).

**Painel esquerdo (navy):**

- Logo branco
- Avatar, nome, role "Administradora", e-mail
- Cards: acesso admin, conta ativa, último acesso

**Formulário direito:**

| Campo | Função |
|-------|--------|
| Nome completo | Edição de nome |
| E-mail | Edição de e-mail |
| Telefone | Edição de telefone |
| Senha atual / nova / confirmar | Troca de senha (validação local) |
| Salvar | Persiste em `localStorage` (`eb_user`) + toast |

---

## Componentes compartilhados do admin

| Componente | Uso |
|------------|-----|
| `StatCard` | Métricas com ícone, valor e texto secundário |
| `PageHeader` | Título, subtítulo e ações no topo das páginas internas |
| `DataTable` | Tabelas com skeleton, empty state e **footer** (paginação) |
| `Pagination` | Exibir 5/10/15/20, contador e navegação de páginas |
| `AlertCard` + `AlertCarousel` | Alertas de estoque no dashboard |
| `BillingChart` | Gráfico de faturamento com filtro mês/ano |
| `OrderDetailModal` | Detalhe cinematográfico da OS |
| `Modal` | Formulários modais (extras, geofence) |
| `Tabs` | Filtro por status nas ordens |
| `usePagination` | Hook reutilizável de paginação |
| `useToast` | Feedback de ações (sucesso, erro, aviso) |

---

## Dados mock principais

**Arquivo:** `constants/adminMockData.js`

| Constante | Conteúdo |
|-----------|----------|
| `MOCK_ORDERS` | 12 ordens de serviço com fotos, GPS e extras |
| `MOCK_PROPERTIES` | 3 propriedades (RJ) |
| `MOCK_USERS` | 5 usuários (cliente, prestador, admin) |
| `MOCK_EXTRAS` | 4 serviços extras |
| `MOCK_INVENTORY_ALERTS` | 2 alertas de estoque crítico |
| `MOCK_BILLING_BY_YEAR` | Faturamento 2025 (12 meses) e 2026 (6 meses) |
| `MOCK_BILLING_REPORT` | Extrato financeiro de exemplo |
| `CURRENT_ADMIN` | Dados da Thalita na sidebar e perfil |
| `ORDER_STATUS` | Labels e variants de badge por status |

---

## Autenticação (entrada do admin)

Rotas fora do dashboard, mas necessárias para acessar o painel:

| Rota | Função |
|------|--------|
| `/login` | Login — form à esquerda, painel navy à direita, texto branco |
| `/register` | Cadastro de cliente/prestador |
| `/forgot-password` | Recuperação de senha (UI; backend pendente) |

Sessão salva em `localStorage`: `eb_token`, `eb_user`.  
Serviço: `services/auth.service.js` → `POST /api/v1/users/login`.

---

## Estrutura de arquivos (admin)

```
eb--front/
├── app/dashboard/
│   ├── page.js              # Centro de Comando
│   ├── properties/page.js
│   ├── users/page.js
│   ├── orders/page.js
│   ├── extras/page.js
│   ├── billing/page.js
│   └── profile/page.js
├── components/
│   ├── organisms/Sidebar/
│   ├── organisms/DataTable/
│   ├── organisms/OrderDetailModal/
│   ├── molecules/StatCard, Pagination, BillingChart, AlertCard, AlertCarousel...
│   └── templates/DashboardLayout, ProfileLayout
├── constants/adminMockData.js
├── hooks/usePagination.js, useToast.js
└── styles/admin.module.css, variables.css
```

---

## Pendências (integração futura)

- [ ] Conectar páginas admin à API real (substituir mocks)
- [ ] Auth guard — redirecionar para `/login` sem token
- [ ] Exportação PDF/CSV no financeiro
- [ ] Endpoint de forgot-password no backend
- [ ] Upload real de fotos antes/depois nas OS
- [ ] Sincronização Airbnb via API (hoje simulada com toast)

---

## Como rodar

```bash
cd eb--front
npm install
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:PORT/api/v1
```

Acesse: `http://localhost:3000/dashboard` (após login).
