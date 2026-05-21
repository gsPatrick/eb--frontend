# Relatório de Prontidão da Interface (UI Readiness Report)

**Projeto:** EB Services and Solutions — Frontend (`eb--front`)  
**Versão auditada:** 1.0.0 (maquete estática)  
**Data:** 20/05/2026  
**Objetivo:** Validar encerramento da fase Design/Frontend Estático antes da integração com a API.

---

## Sumário executivo

| Dimensão | Resultado |
|----------|-----------|
| **Rotas por persona** | 32 rotas mapeadas — **100% criadas visualmente** |
| **Fluxos críticos** | Execução prestador e modais principais — **OK** |
| **Skeleton loaders** | Componente existe — **cobertura parcial (~15%)** |
| **i18n (5 idiomas)** | Funcional em Cliente + Perfil/Settings — **parcial no Admin** |
| **Design tokens** | `variables.css` alinhado ao kit — **~95%** (sem auditoria pixel-perfect Figma) |
| **Prontidão para Axios** | **Não 100%** — recomendado integrar em paralelo a 6 pendências visuais |

**Veredito:** A interface está **estruturalmente completa como maquete** para iniciar integração, porém **não deve ser considerada 100% fechada** até resolver skeletons globais, i18n admin, auth guard e camada HTTP.

---

## 1. Mapa de Rotas e Telas (Por Persona)

Legenda: **OK** = tela implementada com layout, mock data e estados básicos · **Pendente** = ausente ou incompleto para produção.

### ADMIN — Thalita · Administradora

| Rota | Tela | Arquivo | Status visual | Observações |
|------|------|---------|---------------|-------------|
| `/dashboard` | Centro de Comando | `app/dashboard/page.js` | **OK** | StatCards, alertas, gráfico, tabela paginada; **única página admin com skeleton** |
| `/dashboard/properties` | Gestão de Propriedades | `app/dashboard/properties/page.js` | **OK** | Grid, sync iCal (mock), modal geofence |
| `/dashboard/users` | Usuários | `app/dashboard/users/page.js` | **OK** | Tabela, roles, ativar/desativar |
| `/dashboard/orders` | Ordens de Serviço | `app/dashboard/orders/page.js` | **OK** | Tabs por status + `OrderDetailModal` |
| `/dashboard/extras` | Catálogo de Extras | `app/dashboard/extras/page.js` | **OK** | CRUD via modal |
| `/dashboard/billing` | Financeiro | `app/dashboard/billing/page.js` | **OK** | Filtros, extrato, export (mock toast) |
| `/dashboard/contracts` | Modelos de Contrato | `app/dashboard/contracts/page.js` | **OK** | CRUD modal (texto, tipo, versão) |
| `/dashboard/reviews` | Qualidade / Reviews | `app/dashboard/reviews/page.js` | **OK** | StatCards por prestador + tabela |
| `/dashboard/sync-log` | Log Sync iCal | `app/dashboard/sync-log/page.js` | **OK** | Auditoria sucesso/erro por imóvel |
| `/dashboard/profile` | Meu Perfil | `app/dashboard/profile/page.js` | **OK** | Layout 50/50, avatar, senha, idioma |
| `/dashboard/settings` | Configurações | `app/dashboard/settings/page.js` | **OK** | Layout 50/50, idioma, notificações *(extra — não listado no briefing original)* |

**Sidebar admin:** Dashboard, Propriedades, Usuários, Ordens, Extras, Financeiro, Contratos, Qualidade, Sync iCal, Configurações + card perfil.

---

### CLIENTE — Maria Silva · Dona de imóveis

| Rota | Tela | Arquivo | Status visual | Observações |
|------|------|---------|---------------|-------------|
| `/client` | Redirect | `app/client/page.js` | **OK** | → `/client/properties` |
| `/client/properties` | Minhas Propriedades | `app/client/properties/page.js` | **OK** | Status clean, check verde, datas |
| `/client/inventory` | Inventário da Casa | `app/client/inventory/page.js` | **OK** | Alertas críticos, barra de estoque, filtro |
| `/client/contracts` | Meus Contratos | `app/client/contracts/page.js` | **OK** | Aceite digital (mock local) |
| `/client/history` | Histórico de Serviços | `app/client/history/page.js` | **OK** | Fotos antes/depois, download, **modal avaliação** |
| `/client/billing` | Financeiro | `app/client/billing/page.js` | **OK** | Resumo mensal + extrato paginado |
| `/client/profile` | Meu Perfil | `app/client/profile/page.js` | **OK** | Layout 50/50 + i18n |
| `/client/settings` | Configurações | `app/client/settings/page.js` | **OK** | Layout 50/50, 5 idiomas em linha |

---

### PRESTADOR — João · Prestador de serviço

| Rota | Tela | Arquivo | Status visual | Observações |
|------|------|---------|---------------|-------------|
| `/provider` | Redirect | `app/provider/page.js` | **OK** | → `/provider/schedule` |
| `/provider/schedule` | Agenda do Dia | `app/provider/schedule/page.js` | **OK** | Cards das OS de hoje |
| `/provider/execution/[id]` | Execução de OS | `app/provider/execution/[id]/page.js` | **OK** | Fluxo cinematográfico 4 passos |
| `/provider/inventory` | Atualização de Estoque | `app/provider/inventory/page.js` | **OK** | Inputs rápidos por item |
| `/provider/profile` | Meu Perfil | `app/provider/profile/page.js` | **OK** | Layout 50/50 |
| `/provider/settings` | Configurações | `app/provider/settings/page.js` | **OK** | Layout 50/50 compartilhado |

**Pendente (fora do escopo solicitado, mas no backend):** `/provider/contracts` — aceite `provider_eb` não mapeado visualmente.

---

### SISTEMA — Auth e erros

| Rota | Tela | Arquivo | Status visual | Observações |
|------|------|---------|---------------|-------------|
| `/login` | Entrar | `app/login/page.js` | **OK** | Split 50/50, olho senha, **animação login** |
| `/register` | Cadastro | `app/register/page.js` | **OK** | Cliente/Prestador, termos, olho senha |
| `/forgot-password` | Esqueci senha | `app/forgot-password/page.js` | **OK** | UI pronta; backend pendente |
| `/forbidden` | 403 Acesso negado | `app/forbidden/page.js` | **OK** | Marca EB, links de retorno |
| `404` | Não encontrado | `app/not-found.js` | **OK** | Marca EB customizada |
| `/` | Home | `app/page.js` | **OK** | Redirect → `/dashboard` *(sem guard de role)* |
| `/design-system` | Design System | `app/design-system/page.js` | **OK** | Dev only, fora das sidebars |

---

## 2. Validação de Fluxos Críticos

### 2.1 Fluxo de Execução (Prestador)

**Rota:** `/provider/execution/[id]`

| Etapa | Implementado | Detalhe visual |
|-------|--------------|----------------|
| Check-in + GPS | ✅ | Painel 1 — badge GPS, botão desabilitado após check-in |
| Upload fotos **Antes** | ✅ | Painel 2 — input file, preview grid; bloqueado até check-in |
| Checklist **Extras** | ✅ | Painel 3 — checkboxes do catálogo `MOCK_EXTRAS` |
| Check-out + GPS + fotos **Depois** | ✅ | Painel 4 — obriga fotos depois; redirect ao concluir |

**Estados visuais:** painéis desabilitados (`executionPanelDisabled`), hero navy, badges de status OS.

**Pendente visual:** feedback de erro geofence (`OUT_OF_PROXIMITY`), upload progress bar, estado offline.

---

### 2.2 Skeleton Loaders

**Componente:** `components/atoms/Skeleton` — usado por `StatCard`, `DataTable`, `BillingChart`.

| Página / listagem | Skeleton no carregamento? |
|-------------------|---------------------------|
| `/dashboard` (home) | ✅ StatCards + DataTable + BillingChart |
| `/dashboard/users` | ❌ DataTable sem `loading` |
| `/dashboard/orders` | ❌ |
| `/dashboard/extras` | ❌ |
| `/dashboard/billing` (tabela) | ❌ |
| `/dashboard/contracts` | ❌ |
| `/dashboard/reviews` | ❌ |
| `/dashboard/sync-log` | ❌ |
| `/dashboard/properties` (grid) | ❌ |
| `/client/properties` (grid) | ❌ |
| `/client/inventory` (grid) | ❌ |
| `/client/billing` | ❌ |
| `/client/history` | ❌ |
| `/provider/schedule` (cards) | ❌ |

**Conclusão:** Skeleton existe no design system, mas **não está aplicado em todas as listagens** conforme exigido no checklist.

---

### 2.3 Modais

| Modal | Componente | Status | Onde |
|-------|------------|--------|------|
| Detalhe da OS (mapa + fotos) | `OrderDetailModal` | ✅ **OK** | `/dashboard/orders` |
| Avaliação do cliente | `ReviewModal` | ✅ **OK** | `/client/history` |
| Edição de contrato (admin) | `Modal` + form | ✅ **OK** | `/dashboard/contracts` |

**Pendente:** visualizador PDF do contrato (botão "Ver contrato" no cliente é placeholder).

---

### 2.4 i18n (5 idiomas)

**Stack:** i18next + react-i18next · `i18n/locales/{pt,en,es,fr,de}.json` · `LanguageSelector` com bandeiras.

| Área | i18n aplicado? |
|------|----------------|
| Portal Cliente (páginas principais) | ✅ |
| Perfil / Configurações (admin, client, provider) | ✅ |
| Sidebars (parcial) | ⚠️ Admin: mix PT hardcoded + chaves i18n |
| Páginas Admin (dashboard, users, orders…) | ❌ Textos fixos em PT-BR |
| Auth (login, register, forgot) | ❌ PT-BR fixo |
| Prestador (schedule, execution, inventory) | ❌ PT-BR fixo |
| Toasts e validações de formulário | ❌ Majoritariamente PT-BR |

**Conclusão:** Seletor funcional onde está integrado, mas **não em todas as telas**.

---

## 3. Auditoria de Design Tokens

### 3.1 `styles/variables.css` vs Figma

| Token | Figma / Briefing | `variables.css` | Match |
|-------|------------------|-----------------|-------|
| Primary | `#082567` | `--color-primary: #082567` | ✅ |
| Success / Accent | `#54cc8b` | `--color-success`, `--color-accent` | ✅ |
| Background | `#FCFCFC` | `--color-bg: #fcfcfc` | ✅ |
| Fontes | Montserrat + Poppins | `--font-sans`, `--font-heading` | ✅ |
| Sidebar flutuante | Sim | `--sidebar-*`, `--shadow-card` | ✅ |
| Espaçamentos / radius | Kit SaaS | `--space-*`, `--radius-*` | ✅ |

**Não verificado automaticamente:** todos os tokens secundários do Figma (ex.: variantes de tooltip, estados hover de cada componente). Estimativa: **~95% alinhado** com o kit documentado internamente — **não 100%** sem diff pixel a pixel no Figma.

### 3.2 Reutilização Atomic Design

**Estrutura:** `atoms/` → `molecules/` → `organisms/` → `templates/`

| Átomo | Reutilizado? | Exceções |
|-------|--------------|----------|
| `Button` | ✅ Amplo | — |
| `Input` | ✅ Amplo | — |
| `PasswordInput` | ✅ Login, Register, Profile | Admin/client forms de senha no profile |
| `Badge` | ✅ Amplo | — |
| `Select` | ✅ Filtros admin | Alguns `<select>` nativos no client inventory |
| `Checkbox` / `Switch` | ✅ | — |
| `Modal` | ✅ | — |
| `DataTable` | ✅ Admin + client billing | Grids de cards não usam tabela |

**Layouts compartilhados:** `DashboardLayout`, `ClientLayout`, `ProviderLayout`, `AuthLayout`, `ProfileLayout`, `SettingsLayout`.

**Conclusão:** Padrão Atomic Design **seguido consistentemente**; pequenas exceções aceitáveis para maquete.

---

## 4. Conclusão de Maquete

### 4.1 Buracos no fluxo do usuário (não mapeados visualmente)

| # | Buraco | Impacto | Prioridade |
|---|--------|---------|------------|
| 1 | **Auth guard** — rotas abertas sem token/role | Segurança UX | Alta |
| 2 | **403 automático** — página existe, mas não há redirect por role | Segurança UX | Alta |
| 3 | **Skeletons** em listagens/grids | Perceived performance | Média |
| 4 | **i18n admin + auth + provider** | Contrato multilíngue | Média |
| 5 | **Contratos prestador** (`provider_eb`) | Fluxo onboarding prestador | Média |
| 6 | **Estados de erro API** (empty, retry, offline) | Integração real | Alta pós-Axios |
| 7 | **PDF contrato / export financeiro** | Botões placeholder | Baixa (pós-MVP) |
| 8 | **Notificação pós-OS** — review prompt proativo (socket) | Engajamento cliente | Baixa |
| 9 | **Camada HTTP** — só `auth.service.js` com `fetch`; **Axios não instalado** | Integração | Blocker técnico |
| 10 | **Middleware Next.js** | Proteção de rotas | Alta |

### 4.2 Podemos considerar 100% completa para Axios?

| Critério | Resposta |
|----------|----------|
| Todas as telas do contrato EB existem? | **Sim** |
| Fluxos visuais críticos cobertos? | **Sim** (execução, modais, auth animado) |
| Pronta para produção visual? | **Não ainda** |
| Pronta para **iniciar** integração Axios? | **Sim, com ressalvas** |

**Recomendação do desenvolvedor:**

1. **Iniciar integração API** — a estrutura de rotas, layouts, componentes e mocks espelha o backend (`BACKEND_HANDOVER_FINAL.md`).
2. **Em paralelo (Sprint 0 de integração):**
   - Instalar Axios + `services/api.client.js` + interceptors (token, 401 → login).
   - Implementar `middleware.js` + redirect 403 por role.
   - Propagar `loading={true}` nas listagens (`DataTable`, grids).
   - Completar i18n nas páginas admin e auth.
3. **Não declarar fase Design 100% fechada** até skeletons globais e i18n completo — estimativa: **~85% de prontidão visual global**.

---

## 5. Inventário técnico rápido

```
Stack:     Next.js 15 · React 19 · CSS Modules · i18next
Mocks:     constants/adminMockData.js · clientMockData.js · providerMockData.js
Services:  services/auth.service.js (fetch only)
Layouts:   6 templates
Páginas:   32 rotas funcionais (+ design-system)
Build:     next build — OK (última verificação da sprint)
```

---

## 6. Checklist de encerramento da fase estática

- [x] Admin — 10 telas + perfil/settings
- [x] Cliente — 7 telas
- [x] Prestador — 5 telas + execução dinâmica
- [x] Sistema — login, cadastro, forgot, 403, 404
- [x] Execução prestador (4 passos)
- [x] Modais OS, Review, Contrato
- [x] Animações login/logout
- [ ] Skeleton em **todas** as listagens
- [ ] i18n em **todas** as telas
- [ ] Auth guard + middleware
- [ ] Camada Axios / services por domínio
- [ ] Estados erro/vazio padronizados na integração

---

**Assinatura técnica:** Fase de maquete **aprovada para início de integração**, com pendências documentadas acima.  
**Próximo artefato sugerido:** `API_INTEGRATION_PLAN.md` (mapa endpoint → service → página).
