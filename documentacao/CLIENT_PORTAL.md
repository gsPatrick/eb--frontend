# Portal do Cliente — EB Services

Documentação do módulo cliente no frontend (`eb--front`).  
Persona principal: **Maria Silva · Cliente** (`maria@example.com`) — dona de imóveis Airbnb.

**Foco do produto:** transparência e confiança na gestão das propriedades.

---

## Visão geral

O portal do cliente fica sob a rota `/client/*` e usa:

- **ClientSidebar** — navegação, logo, card de perfil e logout
- **ClientLayout** — área de conteúdo sem navbar superior (apenas botão de menu no mobile)
- **Dados mock** — `constants/clientMockData.js` (ainda não conectado à API em produção)
- **i18n** — i18next com 5 idiomas e seletor de bandeiras

### Stack e padrões

| Item | Detalhe |
|------|---------|
| Framework | Next.js 15 (App Router) |
| Estilo | CSS Modules + design tokens (`styles/variables.css`) |
| Estilos do portal | `styles/client.module.css` |
| Fontes | Montserrat + Poppins |
| Cores | Primary `#082567`, success `#54cc8b`, bg `#FCFCFC` |
| Arquitetura | Atomic Design (atoms → molecules → organisms → templates) |
| Traduções | `i18n/locales/{pt,en,es,fr,de}.json` |

---

## Sidebar do cliente

**Arquivo:** `components/organisms/ClientSidebar/ClientSidebar.js`  
**Layout:** reutiliza estilos da sidebar admin (`Sidebar.module.css`)

| Elemento | Função |
|----------|--------|
| Mini header navy | Logo + botão retrair/expandir (persistido em `localStorage`: `eb_client_sidebar_collapsed`) |
| Links de navegação | Rotas principais do portal cliente |
| Card Maria | Link para `/client/profile` (hover, sem ícone) |
| Sair | Limpa `eb_token`, `eb_user` e `eb_locale` → redireciona para `/login` |

### Itens de menu

| Label (PT) | Chave i18n | Rota | Ícone |
|------------|------------|------|-------|
| Minhas Propriedades | `nav.myProperties` | `/client/properties` | properties |
| Inventário da Casa | `nav.inventory` | `/client/inventory` | inventory |
| Meus Contratos | `nav.contracts` | `/client/contracts` | contracts |
| Histórico de Serviços | `nav.history` | `/client/history` | history |
| Configurações | `nav.settings` | `/client/settings` | settings |

> **Perfil** (`/client/profile`) não aparece na sidebar — acessível pelo card do usuário no rodapé.

---

## Rotas

| Rota | Arquivo | Redirecionamento |
|------|---------|------------------|
| `/client` | `app/client/page.js` | Redireciona para `/client/properties` |
| `/client/properties` | `app/client/properties/page.js` | Página principal do portal |
| `/client/inventory` | `app/client/inventory/page.js` | Inventário por imóvel |
| `/client/contracts` | `app/client/contracts/page.js` | Contratos e aceite digital |
| `/client/history` | `app/client/history/page.js` | Histórico com fotos das limpezas |
| `/client/profile` | `app/client/profile/page.js` | Meu perfil (layout 50/50) |
| `/client/settings` | `app/client/settings/page.js` | Configurações (layout 50/50) |

---

## Páginas

### 1. Minhas Propriedades — `/client/properties`

**Arquivo:** `app/client/properties/page.js`  
**Função:** visão clean do status de limpeza de cada imóvel do cliente.

**Header:**
- Título: *Minhas Propriedades*
- Subtítulo: *Acompanhe o status de limpeza de cada imóvel em tempo real.*

**Grid de cards** (1 card por propriedade):

| Elemento | O que faz |
|----------|-----------|
| **Foto do imóvel** | Imagem de capa (`property.photo`) |
| **Badge flutuante** | Status visual no canto da foto — check verde se limpa, alerta se aguardando |
| **Nome + endereço** | Identificação do imóvel |
| **Badge de status** | Mensagem descritiva (ex.: *Imóvel limpo e pronto para hóspedes*) |
| **Última limpeza** | Data formatada conforme idioma |
| **Próxima limpeza** | Data formatada conforme idioma |

**Status de limpeza (`cleanStatus`):**

| Valor | Visual | Badge | Mensagem (PT) |
|-------|--------|-------|---------------|
| `clean` | Check verde (`#54cc8b`) | success | Imóvel limpo e pronto para hóspedes |
| `dirty` | Ícone alerta laranja | warning | Limpeza necessária |
| `scheduled` | Ícone alerta azul | info | Limpeza programada |

**Dados mock exibidos (Maria Silva):**

| Imóvel | Status | Última limpeza | Próxima limpeza |
|--------|--------|----------------|-----------------|
| Apto Copacabana 402 | `clean` | 20/05/2026 | 25/05/2026 |
| Studio Leblon 12 | `scheduled` | 15/05/2026 | 22/05/2026 |

---

### 2. Inventário da Casa — `/client/inventory`

**Arquivo:** `app/client/inventory/page.js`  
**Função:** controle visual do estoque de cada propriedade.

**Header:**
- Título: *Inventário da Casa*
- Subtítulo: *Controle visual do estoque de cada propriedade.*
- **Filtro:** select para *Todas as propriedades* ou imóvel específico

**Grid de cards** (1 card por item de estoque):

| Elemento | O que faz |
|----------|-----------|
| **Nome do item** | Ex.: Papel higiênico, Sabonete líquido |
| **Propriedade** | Imóvel vinculado |
| **Badge de status** | Estoque crítico / Estoque baixo / Em dia |
| **Barra de progresso** | Proporção quantidade ÷ mínimo (vermelho/laranja/verde) |
| **Quantidade / Mínimo** | Valores numéricos com unidade (rolos, un., jogos) |

**Status de estoque (`status`):**

| Valor | Badge | Cor da barra | Card |
|-------|-------|--------------|------|
| `critical` | Estoque crítico (error) | Vermelho | Borda/fundo vermelho suave |
| `low` | Estoque baixo (warning) | Laranja | Borda/fundo laranja suave |
| `ok` | Em dia (success) | Verde | Padrão |

**Dados mock exibidos:**

| Item | Propriedade | Qtd | Mín | Status |
|------|-------------|-----|-----|--------|
| Papel higiênico | Apto Copacabana 402 | 2 rolos | 6 | **Crítico** |
| Sabonete líquido | Apto Copacabana 402 | 4 un. | 3 | OK |
| Detergente | Apto Copacabana 402 | 1 un. | 2 | Baixo |
| Papel higiênico | Studio Leblon 12 | 8 rolos | 6 | OK |
| Lençóis extras | Studio Leblon 12 | 1 jogo | 4 | **Crítico** |
| Shampoo | Studio Leblon 12 | 2 un. | 2 | Baixo |

---

### 3. Meus Contratos — `/client/contracts`

**Arquivo:** `app/client/contracts/page.js`  
**Função:** visualizar contratos da EB Services e aceitar digitalmente.

**Header:**
- Título: *Meus Contratos*
- Subtítulo: *Visualize e aceite digitalmente o contrato de serviços da EB.*

**Lista de cards** (1 card por contrato):

| Elemento | O que faz |
|----------|-----------|
| **Título do contrato** | Nome do documento |
| **Versão + data de aceite** | Metadados (data só se aceito) |
| **Badge** | Aceito (verde) ou Pendente (amarelo) |
| **Texto do contrato** | Resumo dos termos (SLA, confidencialidade, faturamento) |
| **Ver contrato** | Botão secundário (UI — PDF ainda não integrado) |
| **Aceitar digitalmente** | Botão primário — só aparece se pendente |

**Ação — Aceite digital:**
1. Cliente clica em *Aceitar digitalmente*
2. Status muda para `accepted` e grava `signedAt` com data/hora atual
3. Toast de sucesso: *Contrato aceito*
4. Botão de aceite desaparece

**Dados mock exibidos:**

| Contrato | Versão | Status | Aceito em |
|----------|--------|--------|-----------|
| Contrato EB Services — Limpeza e Manutenção | 2.1 | Aceito | 15/01/2026 |
| Aditivo — Serviços Extras Premium | 1.0 | **Pendente** | — |

---

### 4. Histórico de Serviços — `/client/history`

**Arquivo:** `app/client/history/page.js`  
**Função:** baixar fotos das limpezas passadas para garantir qualidade.

**Header:**
- Título: *Histórico de Serviços*
- Subtítulo: *Baixe as fotos das limpezas realizadas para garantir a qualidade.*

**Lista de cards** (1 card por OS concluída):

| Elemento | O que faz |
|----------|-----------|
| **Propriedade** | Nome do imóvel |
| **Data + prestador** | Metadados da limpeza |
| **Baixar todas** | Botão que dispara download de todas as fotos (antes + depois) |
| **Seção Antes** | Grid de thumbnails `beforePhotos` |
| **Seção Depois** | Grid de thumbnails `afterPhotos` |
| **Sem fotos** | Mensagem quando não há imagens |

**Ação — Download:**
- Itera URLs das fotos e abre download via `<a download>`
- Se não houver fotos → toast de aviso

**Dados mock exibidos (OS concluídas de Maria Silva):**

| OS | Propriedade | Prestador | Data | Fotos antes | Fotos depois |
|----|-------------|-----------|------|-------------|--------------|
| os4 | Apto Copacabana 402 | João Prestador | 18/05/2026 | 1 | 1 |

> Outras OS da Maria com status `completed` também entram se existirem no mock.

---

### 5. Meu Perfil — `/client/profile`

**Arquivo:** `app/client/profile/page.js`  
**Componentes:** `ProfileLayout` (50/50) + `ProfileForm`  
**Função:** edição de dados pessoais, avatar, idioma e senha.

#### Painel esquerdo (navy)

| Elemento | Conteúdo |
|----------|----------|
| Logo | Link para `/client/properties` |
| Avatar | Foto ou iniciais do usuário |
| Nome | Maria |
| Role | Cliente |
| E-mail | maria@example.com |
| 3 stat cards | Cliente · Ativa · Último acesso |

#### Painel direito (formulário)

| Seção | Campos / ações |
|-------|----------------|
| **Foto de perfil** | Upload JPG/PNG até 2 MB (`AvatarUpload`) |
| **Informações pessoais** | Nome completo, e-mail, telefone |
| **Idioma** | Seletor de bandeiras em linha (5 idiomas) |
| **Segurança** | Senha atual, nova senha, confirmar senha |
| **Salvar** | Persiste em `localStorage` (`eb_user`) + toast |

---

### 6. Configurações — `/client/settings`

**Arquivo:** `app/client/settings/page.js`  
**Componentes:** `SettingsLayout` (50/50) + `SettingsForm`  
**Função:** preferências de idioma e notificações.

#### Painel esquerdo (navy) — resumo dinâmico

| Stat | Conteúdo |
|------|----------|
| Idioma atual | Bandeira + nome (ex.: 🇧🇷 Português) |
| Alertas por e-mail | Ativado / Desativado |
| Alertas push | Ativado / Desativado |

> Atualiza em tempo real conforme o usuário altera as opções no formulário.

#### Painel direito (formulário)

| Card | Conteúdo |
|------|----------|
| **Idioma** | Descrição + bandeiras em **uma linha** (🇧🇷 🇺🇸 🇪🇸 🇫🇷 🇩🇪) + indicador do idioma selecionado |
| **Notificações** | Toggle e-mail (estoque crítico, contratos, serviços) + toggle push |
| **Salvar** | Persiste em `localStorage` (`eb_settings`) + toast |

---

## Internacionalização (i18n)

**Config:** `i18n/config.js`  
**Provider:** `context/I18nProvider.js`  
**Seletor:** `components/molecules/LanguageSelector`

### Idiomas disponíveis

| Código | Idioma | Bandeira | Intl |
|--------|--------|----------|------|
| `pt` | Português | 🇧🇷 | pt-BR |
| `en` | English | 🇺🇸 | en-US |
| `es` | Español | 🇪🇸 | es-ES |
| `fr` | Français | 🇫🇷 | fr-FR |
| `de` | Deutsch | 🇩🇪 | de-DE |

**Persistência:** `localStorage` → `eb_locale`  
**Extensível:** adicionar entrada em `LOCALES` + arquivo JSON em `i18n/locales/`

**Onde aparece tradução no portal:**
- Sidebar (labels de menu, logout, role)
- Todas as páginas (títulos, subtítulos, badges, botões, toasts)
- Perfil e configurações (formulários completos)
- Datas formatadas via `Intl` conforme idioma ativo

---

## Componentes reutilizados

| Componente | Uso no portal cliente |
|------------|----------------------|
| `ClientLayout` | Shell de todas as páginas |
| `ClientSidebar` | Navegação lateral |
| `PageHeader` | Título + subtítulo + ações (filtro no inventário) |
| `ProfileLayout` | Layout 50/50 do perfil |
| `ProfileForm` | Formulário compartilhado admin/cliente |
| `SettingsLayout` | Layout 50/50 das configurações |
| `SettingsForm` | Formulário compartilhado admin/cliente |
| `LanguageSelector` | Bandeiras em linha (`variant="row"`) |
| `AvatarUpload` | Upload de foto no perfil |
| `Badge` | Status de limpeza, estoque, contrato |
| `Button` | Ações (aceitar contrato, baixar fotos, salvar) |
| `Switch` | Toggles de notificação |
| `Icon` | check, alert, download, menu, logout |
| `useToast` | Feedback de ações |

---

## Dados mock principais

**Arquivo:** `constants/clientMockData.js`

| Constante | Conteúdo |
|-----------|----------|
| `CURRENT_CLIENT` | Maria Silva — sidebar, perfil e fallback |
| `CLIENT_PROPERTIES` | 2 imóveis da Maria com `cleanStatus`, datas de limpeza |
| `CLIENT_INVENTORY` | 6 itens de estoque (2 críticos, 2 baixos, 2 OK) |
| `CLIENT_CONTRACTS` | 2 contratos (1 aceito, 1 pendente) |
| `CLIENT_SERVICE_HISTORY` | OS concluídas da Maria com fotos antes/depois |
| `CLEAN_STATUS` | Variants de badge por status de limpeza |

**Origem cruzada:** propriedades e histórico derivam de `constants/adminMockData.js` (`MOCK_PROPERTIES`, `MOCK_ORDERS`).

---

## Autenticação e acesso

| Comportamento | Detalhe |
|---------------|---------|
| Login com `role: client` | Redireciona para `/client/properties` |
| Login admin/provider | Redireciona para `/dashboard` |
| Sessão | `localStorage`: `eb_token`, `eb_user` |
| Auth guard | **Pendente** — rotas `/client/*` acessíveis sem token hoje |
| Logout | Limpa token, user e locale → `/login` |

**Serviço:** `services/auth.service.js` → `POST /api/v1/users/login`

---

## Mapeamento com a API (backend)

Endpoints previstos para integração futura:

| Página frontend | Endpoint API |
|-----------------|--------------|
| Minhas Propriedades | `GET /properties` (filtrado por clientId) |
| Inventário | `GET /inventory` (estoque dos imóveis do cliente) |
| Contratos | `GET /contracts`, `GET /contracts/acceptances/me`, `POST /contracts/:id/accept` |
| Histórico | `GET /service-orders` (OS concluídas + fotos before/after) |
| Perfil | `GET/PATCH /users/me`, `PATCH /users/me/avatar` |
| Configurações | `PATCH /users/me` (locale) + preferências futuras |

**Socket.io (ouvir):** `ORDER_COMPLETED`, `INVENTORY_CRITICAL` (do imóvel do cliente).

---

## Estrutura de arquivos (cliente)

```
eb--front/
├── app/client/
│   ├── page.js                 # redirect → /client/properties
│   ├── properties/page.js      # Minhas Propriedades
│   ├── inventory/page.js       # Inventário da Casa
│   ├── contracts/page.js       # Meus Contratos
│   ├── history/page.js         # Histórico de Serviços
│   ├── profile/page.js         # Meu Perfil
│   └── settings/page.js        # Configurações
├── components/
│   ├── organisms/ClientSidebar/
│   ├── organisms/ProfileForm/
│   ├── organisms/SettingsForm/
│   ├── molecules/LanguageSelector, AvatarUpload, PageHeader...
│   └── templates/ClientLayout, ProfileLayout, SettingsLayout
├── constants/clientMockData.js
├── i18n/
│   ├── config.js
│   ├── index.js
│   └── locales/{pt,en,es,fr,de}.json
├── context/I18nProvider.js
├── utils/profileHelpers.js
└── styles/client.module.css
```

---

## Checklist de revisão (para validar se está correto)

Use esta lista para conferir se o escopo atende ao briefing:

- [ ] **Minhas Propriedades** — status clean com check verde elegante
- [ ] **Inventário** — alerta visual de estoque crítico (ex.: papel higiênico)
- [ ] **Contratos** — visualização + aceite digital
- [ ] **Histórico** — download de fotos das limpezas passadas
- [ ] **Perfil** — dados pessoais, avatar, troca de idioma
- [ ] **Configurações** — layout 50/50, idioma em linha, notificações
- [ ] **i18n** — 5 idiomas com bandeiras, extensível para mais
- [ ] **Foco** — transparência e confiança para o dono do Airbnb

---

## Pendências (integração futura)

- [ ] Conectar páginas à API real (substituir mocks)
- [ ] Auth guard — redirecionar para `/login` sem token ou role incorreto
- [ ] PDF real dos contratos (botão *Ver contrato*)
- [ ] Upload real de avatar via `PATCH /users/me/avatar`
- [ ] Salvar perfil/configurações via `PATCH /users/me`
- [ ] Socket.io para alertas de estoque crítico e OS concluída em tempo real
- [ ] Download em ZIP das fotos (hoje baixa uma a uma)
- [ ] Status `dirty` no mock (hoje só `clean` e `scheduled` estão nos dados)

---

## Como rodar e testar

```bash
cd eb--front
npm install
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:PORT/api/v1
```

**Acesso direto (sem login):**
- `http://localhost:3000/client/properties`
- `http://localhost:3000/client/inventory`
- `http://localhost:3000/client/contracts`
- `http://localhost:3000/client/history`
- `http://localhost:3000/client/profile`
- `http://localhost:3000/client/settings`

**Via login:** usuário com `role: client` → redireciona para `/client/properties`.

**Mock de referência:** Maria Silva · `maria@example.com`
