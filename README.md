# Data Green 🌱

> **Plataforma completa de gestão para ONGs e organizações do terceiro setor**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 Sobre o Projeto

**Data Green** é uma plataforma inovadora desenvolvida para facilitar a gestão completa de ONGs e organizações do terceiro setor. Com foco no monitoramento de impacto social e cálculo automatizado do Índice de Desenvolvimento Humano (IDH), a aplicação oferece uma solução completa para:

- 🎯 **Gestão de Projetos Sociais** - Controle completo do ciclo de vida dos projetos
- 👥 **Gerenciamento de Beneficiários** - Acompanhamento detalhado de pessoas impactadas
- 💰 **Controle Financeiro** - Gestão de investidores e aportes por projeto
- 📊 **Relatórios Estratégicos** - Geração de PDFs profissionais para stakeholders
- 🗺️ **Visualização Geográfica** - Mapas interativos das comunidades atendidas
- 📈 **Cálculo Automático de IDH** - Baseado em dados reais dos beneficiários

## 🚀 Funcionalidades Principais

### ✅ **CRUD Completo**
- **Comunidades** - Gestão de localidades com cálculo automático de IDH
- **Projetos** - Controle de status, orçamento e categorização
- **Pessoas** - Relacionamento N:N com projetos e indicadores de saúde
- **Investidores** - Gestão de diferentes tipos de investidores
- **Aportes** - Controle financeiro detalhado por projeto

### 📊 **Sistema de Evolução**
- **Evolução de Projetos** - Acompanhamento de marcos e desafios
- **Evolução de Pessoas** - Indicadores de saúde, educação e renda
- **Impacto no IDH** - Recálculo automático baseado em mudanças

### 📋 **Relatórios Profissionais**
- **Relatórios Anuais** - Transparência organizacional completa
- **Relatórios Estratégicos** - Apresentações para investidores
- **Dashboard Interativo** - Métricas em tempo real

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 18.3.1** com TypeScript
- **Vite 5.4.19** para build otimizado
- **Tailwind CSS 3.4.17** + shadcn/ui para design system
- **React Router DOM 6.30.1** para roteamento
- **TanStack React Query 5.83.0** para gerenciamento de estado
- **React Hook Form 7.61.1** + Zod 3.25.76 para formulários

### **Backend & Infraestrutura**
- **Supabase** (PostgreSQL + Auth + Edge Functions)
- **Row Level Security (RLS)** implementado
- **Triggers automáticos** para cálculos de IDH
- **Real-time subscriptions** disponíveis

### **Bibliotecas Especializadas**
- **Mapbox GL JS 3.14.0** + React Map GL 8.0.4 para mapas
- **jsPDF 3.0.2** + jsPDF-autotable 5.0.2 para geração de PDFs
- **Recharts 2.15.4** para gráficos e visualizações
- **date-fns 3.6.0** para manipulação de datas
- **Sonner 1.7.4** para notificações

## 🏗️ Arquitetura do Projeto

```
data-green/
├── 📁 public/                  # Arquivos estáticos e locales
├── 📁 src/
│   ├── 📁 assets/             # Imagens e recursos
│   ├── 📁 components/         # Componentes React
│   │   ├── 📁 admin/         # Componentes administrativos
│   │   ├── 📁 auth/          # Autenticação
│   │   ├── 📁 forms/         # Formulários especializados
│   │   ├── 📁 layout/        # Layout responsivo
│   │   └── 📁 ui/            # Componentes base (shadcn/ui)
│   ├── 📁 hooks/             # Custom hooks
│   ├── 📁 integrations/      # Integrações externas
│   ├── 📁 pages/             # Páginas da aplicação
│   └── 📁 lib/               # Utilitários e configurações
├── 📁 supabase/
│   ├── 📁 functions/         # Edge Functions
│   ├── 📁 migrations/        # 17+ migrações do banco
│   └── 📄 config.toml        # Configuração Supabase
└── 📄 [arquivos de configuração]
```

## 🚀 Instalação e Execução

### **Pré-requisitos**
- Node.js 18+ ([instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm ou yarn
- Conta no Supabase

### **Configuração Local**

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd data-green
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase
```

4. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

5. **Acesse a aplicação**
```
http://localhost:5173
```

### **Build para Produção**
```bash
npm run build
npm run preview
```

## 🔐 Sistema de Permissões

### **Tipos de Usuário**
- **🔧 Admin Global** - Acesso total ao sistema
- **👑 Master ONG** - Gerencia uma ONG específica
- **👤 Colaborador ONG** - Acesso limitado aos projetos da ONG

### **Segurança Implementada**
- ✅ Row Level Security (RLS) no Supabase
- ✅ Autenticação JWT via Supabase Auth
- ✅ Validação client-side e server-side
- ✅ Auditoria completa de acessos sensíveis
- ✅ Isolamento de dados por organização

## 📊 Cálculo Automático do IDH

O sistema calcula automaticamente o IDH das comunidades baseado em três dimensões:

### **🏥 Longevidade** (70% idade + 30% saúde)
- Idade média dos beneficiários
- Indicadores de IMC e saúde

### **🎓 Educação**
- Nível de escolaridade
- Anos de estudo completados

### **💰 Renda**
- Faixa de renda familiar
- Distribuição socioeconômica

**Fórmula**: `IDH = (Longevidade × Educação × Renda)^(1/3)`

## 🗺️ Páginas da Aplicação

| Rota | Descrição | Funcionalidades |
|------|-----------|-----------------|
| `/` | Landing page | Autenticação e apresentação |
| `/dashboard` | Painel principal | Métricas, mapa interativo, setup |
| `/communities` | Gestão de comunidades | CRUD completo com cálculo de IDH |
| `/projects` | Gestão de projetos | Status, orçamento, categorização |
| `/people` | Gestão de beneficiários | Relacionamento N:N, indicadores |
| `/investors` | Gestão de investidores | Tipos, documentos, validação |
| `/aportes` | Gestão financeira | Contribuições por projeto |
| `/project-evolution` | Evolução de projetos | Marcos, desafios, progresso |
| `/person-evolution` | Evolução de pessoas | Saúde, educação, renda |
| `/reports` | Hub de relatórios | Navegação para diferentes tipos |
| `/annual-report` | Relatórios anuais | PDFs de transparência |
| `/strategic-report` | Relatórios estratégicos | Apresentações para investidores |
| `/admin` | Painel administrativo | Gestão global do sistema |

## 🎨 Design System

### **Paleta de Cores**
- **🟢 Primary**: `hsl(142 76% 36%)` - Verde sustentabilidade
- **⚪ Background**: `hsl(0 0% 100%)` - Branco puro
- **🔵 Info**: `hsl(221.2 83.2% 53.3%)` - Azul informativo
- **🟡 Warning**: `hsl(38 92% 50%)` - Amarelo alerta
- **🔴 Destructive**: `hsl(0 84.2% 60.2%)` - Vermelho erro

### **Componentes UI**
- 50+ componentes shadcn/ui customizados
- Design responsivo mobile-first
- Modo escuro implementado
- Acessibilidade WCAG 2.1

## 📈 Performance e Otimizações

### **Frontend**
- ⚡ Lazy loading de componentes
- 🔄 Cache inteligente com React Query
- 📱 Layout responsivo sem JavaScript adicional
- 💾 Persistência de estado no localStorage

### **Backend**
- 🗃️ Indexes otimizados para queries frequentes
- 🔄 Triggers automáticos eficientes
- 📊 Consultas paralelas no dashboard
- 🔒 Funções stored procedures para cálculos complexos

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🏆 Desenvolvido por

**CreateHack - Grupo 17 - Data Green**

---

<div align="center">

**🌱 Transformando dados em impacto social positivo 🌱**

*Versão 2.0.0 - Desenvolvido com ❤️ para o terceiro setor*

</div>
