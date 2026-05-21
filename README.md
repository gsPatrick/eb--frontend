# EB Services — Frontend Dashboard

Painel administrativo da **EB Services and Solutions** construído com Next.js App Router, Atomic Design e CSS Modules.

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **JavaScript** (sem TypeScript)
- **CSS Modules** + Design Tokens (`styles/variables.css`)
- Sem bibliotecas de UI externas

## Design System

Tokens extraídos do [SaaS Dashboard UI Kit (Figma Community)](https://www.figma.com/design/dHbhfjBb6NUhowDqlWpjbJ/SaaS-Dashboard---UI-Kit--Community-):

- Primary indigo `#5046E5`
- Sidebar escura `#0B0F19`
- Glassmorphism + sombras premium
- Skeleton shimmer
- Transições 300ms ease

## Estrutura

```
eb--front/
├── app/                    # Rotas Next.js
├── components/
│   ├── atoms/              # Button, Input, Skeleton, Badge...
│   ├── molecules/          # Card, Modal, Toast, FormField...
│   ├── organisms/          # Sidebar, Navbar, DataTable...
│   └── templates/          # DashboardLayout
├── hooks/                  # useModal, useToast, useMediaQuery
├── styles/                 # variables.css, globals.css
└── utils/                  # formatters, cn
```

## Começar

```bash
cd eb--front
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Componentes implementados

### Atoms
Button, Input, Label, Textarea, Select, Checkbox, Switch, Badge, Avatar, Icon, Skeleton, Spinner, Divider

### Molecules
FormField, SearchField, Card, ListItem, Modal, Toast, Dropdown, StatCard, EmptyState, Tabs

### Organisms
Sidebar, Navbar, DataTable, ConfirmModal, ToastContainer

### Templates
DashboardLayout (Sidebar + Navbar + content)

## Próximos passos

1. Conectar autenticação JWT com `eb--api`
2. Integrar Socket.io (`ORDER_CHECKIN`, `INVENTORY_CRITICAL`, etc.)
3. Construir páginas reais (`/dashboard/users`, `/dashboard/properties`...)

## API Backend

Ver `../eb--api/src/documentacao/BACKEND_HANDOVER_FINAL.md`
