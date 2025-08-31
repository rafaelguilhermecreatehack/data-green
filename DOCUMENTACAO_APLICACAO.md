# ONG Harmony - Documentação da Aplicação

## Contexto da Aplicação

**ONG Harmony** é uma plataforma completa de gestão para ONGs e organizações do terceiro setor, focada no monitoramento de impacto social e cálculo automatizado do Índice de Desenvolvimento Humano (IDH). A aplicação permite o gerenciamento completo de projetos sociais, beneficiários, investidores, aportes financeiros e geração de relatórios profissionais.

### Propósito
- Facilitar a gestão completa de ONGs e projetos sociais
- Automatizar o cálculo do IDH baseado em dados reais dos beneficiários
- Conectar investidores com projetos de impacto social através de aportes
- Gerenciar pessoas (beneficiários) com indicadores de saúde e educação
- Controlar investimentos e contribuições financeiras por projeto
- Gerar relatórios e dashboards para acompanhamento de resultados
- Promover transparência e eficiência no terceiro setor

### Público-Alvo
- **ONGs e organizações do terceiro setor**: Gestão completa de projetos e beneficiários
- **Administradores globais da plataforma**: Supervisão de todas as organizações
- **Masters de ONG**: Gerenciamento completo de uma organização específica
- **Colaboradores de ONG**: Acesso limitado aos projetos da organização
- **Investidores sociais**: Acompanhamento de aportes e impacto dos investimentos
- **Beneficiários de projetos sociais**: Pessoas impactadas pelos projetos

---

## Resumo da Estrutura

### Stack Tecnológico
- **Frontend**: React 18.3.1 com TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Roteamento**: React Router DOM 6.30.1
- **Gerenciamento de Estado**: TanStack React Query 5.83.0
- **Formulários**: React Hook Form 7.61.1 + Zod 3.25.76
- **UI Components**: Radix UI primitives

### Arquitetura do Projeto
```
ong-harmony/
├── public/                     # Arquivos estáticos
├── src/
│   ├── assets/                # Imagens e recursos
│   ├── components/            # Componentes React
│   │   ├── admin/            # Componentes administrativos
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── forms/            # Formulários
│   │   ├── layout/           # Layout e navegação
│   │   └── ui/               # Componentes base (shadcn/ui)
│   ├── hooks/                # Custom hooks
│   ├── integrations/         # Integrações externas
│   │   └── supabase/        # Cliente e tipos Supabase
│   ├── pages/               # Páginas da aplicação
│   └── lib/                 # Utilitários e configurações
├── supabase/
│   ├── functions/           # Edge Functions
│   ├── migrations/          # Migrações do banco
│   └── config.toml         # Configuração Supabase
└── [arquivos de configuração]
```

### Páginas Principais
1. **Index** (`/`) - Landing page e autenticação
2. **Dashboard** (`/dashboard`) - Painel principal do usuário
3. **Communities** (`/communities`) - Gestão de comunidades
4. **Projects** (`/projects`) - Gestão de projetos sociais
5. **People** (`/people`) - Gestão de beneficiários/pessoas
6. **Investors** (`/investors`) - Gestão de investidores
7. **Aportes** (`/aportes`) - Gestão de contribuições financeiras
8. **Project Evolution** (`/project-evolution`) - Acompanhamento da evolução de projetos
9. **Person Evolution** (`/person-evolution`) - Acompanhamento da evolução de pessoas
10. **Admin** (`/admin`) - Painel administrativo global
11. **NotFound** (`/*`) - Página 404 para rotas não encontradas

---

## Paleta de Cores

### Cores Primárias
- **Primary**: `hsl(142 76% 36%)` - Verde principal (tema sustentabilidade)
- **Primary Foreground**: `hsl(355 100% 97%)` - Texto sobre verde
- **Background**: `hsl(0 0% 100%)` - Branco puro
- **Foreground**: `hsl(224 71.4% 4.1%)` - Texto principal escuro

### Cores Secundárias
- **Secondary**: `hsl(220 14.3% 95.9%)` - Cinza claro
- **Secondary Foreground**: `hsl(220.9 39.3% 11%)` - Texto sobre cinza
- **Accent**: `hsl(142 76% 36%)` - Verde de destaque (igual ao primary)
- **Accent Foreground**: `hsl(355 100% 97%)` - Texto sobre accent
- **Muted**: `hsl(220 14.3% 95.9%)` - Cinza suave para textos secundários
- **Muted Foreground**: `hsl(220 8.9% 46.1%)` - Texto muted

### Cores de Estado
- **Success**: `hsl(142 76% 36%)` - Verde para sucesso
- **Success Foreground**: `hsl(355 100% 97%)` - Texto sobre sucesso
- **Info**: `hsl(221.2 83.2% 53.3%)` - Azul para informações
- **Info Foreground**: `hsl(210 40% 98%)` - Texto sobre info
- **Warning**: `hsl(38 92% 50%)` - Amarelo para avisos
- **Warning Foreground**: `hsl(48 96% 89%)` - Texto sobre warning
- **Destructive**: `hsl(0 84.2% 60.2%)` - Vermelho para erros
- **Destructive Foreground**: `hsl(210 40% 98%)` - Texto sobre erro

### Cores de Interface
- **Border**: `hsl(220 13% 91%)` - Bordas padrão
- **Input**: `hsl(220 13% 91%)` - Campos de entrada
- **Ring**: `hsl(142 76% 36%)` - Foco em elementos
- **Card**: `hsl(0 0% 100%)` - Fundo de cards
- **Card Foreground**: `hsl(224 71.4% 4.1%)` - Texto em cards
- **Popover**: `hsl(0 0% 100%)` - Fundo de popovers
- **Popover Foreground**: `hsl(224 71.4% 4.1%)` - Texto em popovers

### Cores da Sidebar
- **Sidebar Background**: `hsl(0 0% 98%)` - Fundo da sidebar
- **Sidebar Foreground**: `hsl(240 5.3% 26.1%)` - Texto da sidebar
- **Sidebar Primary**: `hsl(240 5.9% 10%)` - Elementos primários da sidebar
- **Sidebar Primary Foreground**: `hsl(0 0% 98%)` - Texto sobre primário
- **Sidebar Accent**: `hsl(240 4.8% 95.9%)` - Accent da sidebar
- **Sidebar Accent Foreground**: `hsl(240 5.9% 10%)` - Texto sobre accent
- **Sidebar Border**: `hsl(220 13% 91%)` - Bordas da sidebar
- **Sidebar Ring**: `hsl(217.2 91.2% 59.8%)` - Foco na sidebar

### Gradientes Personalizados
- **Gradient Primary**: `linear-gradient(135deg, hsl(142 76% 36%), hsl(142 76% 46%))`
- **Gradient Hero**: `linear-gradient(135deg, hsl(142 76% 36%), hsl(221.2 83.2% 53.3%))`
- **Gradient Subtle**: `linear-gradient(180deg, hsl(142 76% 98%), hsl(0 0% 100%))`

### Sombras
- **Elegant**: `0 10px 30px -10px hsl(142 76% 36% / 0.2)`
- **Glow**: `0 0 40px hsl(142 76% 46% / 0.15)`

### Modo Escuro
A aplicação suporta modo escuro com paleta adaptada:
- **Background**: `hsl(222.2 84% 4.9%)` - Fundo escuro principal
- **Foreground**: `hsl(210 40% 98%)` - Texto claro principal
- **Card**: `hsl(222.2 84% 4.9%)` - Fundo de cards escuro
- **Primary**: `hsl(210 40% 98%)` - Primário invertido
- **Secondary**: `hsl(217.2 32.6% 17.5%)` - Cinza escuro
- **Muted**: `hsl(217.2 32.6% 17.5%)` - Muted escuro
- **Border**: `hsl(217.2 32.6% 17.5%)` - Bordas escuras
- **Input**: `hsl(217.2 32.6% 17.5%)` - Campos escuros
- **Ring**: `hsl(212.7 26.8% 83.9%)` - Foco claro
- **Sidebar Background**: `hsl(240 5.9% 10%)` - Sidebar escura
- **Sidebar Primary**: `hsl(224.3 76.3% 48%)` - Primário da sidebar escura
- Todas as cores ajustadas para melhor contraste e acessibilidade

---

## Lógica de Programação

### Padrões Arquiteturais

#### 1. Component-Based Architecture
- Componentes funcionais com hooks
- Separação clara entre lógica de negócio e apresentação
- Reutilização através de componentes base (shadcn/ui)

#### 2. Custom Hooks Pattern
```typescript
// Exemplo: useToast hook para notificações
const { toast } = useToast();
toast({
  title: "Sucesso!",
  description: "Operação realizada com sucesso",
  variant: "default"
});
```

#### 3. Server State Management
- TanStack React Query para cache e sincronização
- Invalidação automática de queries
- Loading e error states gerenciados

#### 4. Form Validation
- React Hook Form + Zod para validação
- Schemas tipados e reutilizáveis
- Feedback visual em tempo real

### Fluxo de Autenticação
```typescript
// Verificação de sessão
const { data: { session } } = await supabase.auth.getSession();

// Listener para mudanças de auth
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    navigate("/dashboard");
  } else {
    navigate("/");
  }
});
```

### Integração com Supabase
- Cliente configurado com persistência de sessão
- Tipos TypeScript gerados automaticamente
- Row Level Security (RLS) implementado
- Real-time subscriptions disponíveis

### Padrão de Loading States
```typescript
const [loading, setLoading] = useState(true);

// Componente de loading consistente
if (loading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
```

### Layout Responsivo Avançado
```typescript
// Layout.tsx - Sistema responsivo automático
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Persistência do estado da sidebar
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Sidebar />}
      <main className={cn(
        "transition-all duration-300",
        isMobile 
          ? "pb-20" // Espaço para bottom bar
          : sidebarCollapsed 
            ? "ml-16" // Sidebar colapsada
            : "ml-64", // Sidebar expandida
        "min-h-screen"
      )}>
        {children}
      </main>
      {isMobile && <BottomBar />}
    </div>
  );
};
```

### Sistema de Métricas do Dashboard
```typescript
// Dashboard.tsx - Cálculo de métricas em tempo real
const fetchDashboardMetrics = async () => {
  const [projectsRes, peopleRes, communitiesRes, investorsRes, contributionsRes] = 
    await Promise.all([
      supabase.from('projetos').select('*, comunidades(cidade, estado)', { count: 'exact' }),
      supabase.from('pessoas').select('*', { count: 'exact' }),
      supabase.from('comunidades').select('*, projetos(id)', { count: 'exact' }),
      supabase.from('investidores').select('*', { count: 'exact' }),
      supabase.from('aportes').select('*, projetos(nome_projeto), investidores(nome_investidor)')
    ]);

  // Cálculos automáticos de distribuição por status
  const projectsByStatus = projects.reduce((acc: any, project: any) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});

  // Valor total de contribuições
  const totalContributionValue = contributions.reduce((sum: number, contrib: any) => {
    return sum + (parseFloat(contrib.valor_aporte) || 0);
  }, 0);
};
```

---

## Regras de Negócio

### 1. Sistema de Usuários e Permissões

#### Tipos de Usuário
- **Admin Global**: Acesso total ao sistema
- **Master ONG**: Gerencia uma ONG específica
- **Colaborador ONG**: Acesso limitado aos projetos da ONG

#### Regras de Acesso
- Admin Global pode acessar todos os dados
- Masters podem gerenciar apenas sua ONG
- Colaboradores podem visualizar e editar projetos de sua ONG
- RLS implementado no banco para garantir segurança

### 2. Gestão de Comunidades

#### Estrutura de Dados
```sql
CREATE TABLE comunidades (
    id UUID PRIMARY KEY,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    bairro TEXT NOT NULL,
    idh DECIMAL(4,3) DEFAULT 0.000,
    total_beneficiarios INTEGER DEFAULT 0
);
```

#### Regras
- Comunidades podem ser criadas por Masters e Admins
- IDH é calculado automaticamente baseado nos beneficiários
- Total de beneficiários atualizado via triggers

### 3. Cálculo Automático do IDH

#### Algoritmo Implementado
O IDH é calculado usando três dimensões:

**Longevidade** (70% idade média + 30% indicadores saúde):
```sql
-- Baseado na idade média e IMC dos beneficiários
AVG(EXTRACT(YEAR FROM age(data_nascimento))) / 80.0 * 0.7 +
AVG(CASE 
  WHEN imc BETWEEN 18.5 AND 25 THEN 1.0
  WHEN imc BETWEEN 25 AND 30 THEN 0.8
  ELSE 0.6
END) * 0.3
```

**Educação**:
```sql
-- Baseado no nível de escolaridade
CASE nivel_escolaridade
  WHEN 'sem_escolaridade' THEN 0
  WHEN 'fundamental_incompleto' THEN 4
  WHEN 'fundamental_completo' THEN 8
  WHEN 'medio_incompleto' THEN 10
  WHEN 'medio_completo' THEN 12
  WHEN 'superior_incompleto' THEN 14
  WHEN 'superior_completo' THEN 16
  WHEN 'pos_graduacao' THEN 18
END / 18.0
```

**Renda**:
```sql
-- Baseado na faixa de renda familiar
CASE faixa_renda_familiar
  WHEN 'ate_1_salario' THEN 0.2
  WHEN '1_2_salarios' THEN 0.4
  WHEN '2_3_salarios' THEN 0.6
  WHEN '3_5_salarios' THEN 0.8
  WHEN 'acima_5_salarios' THEN 1.0
END
```

**Fórmula Final**: `IDH = (Longevidade × Educação × Renda)^(1/3)`

### 4. Gestão de Projetos

#### Status de Projetos
- **Planejamento**: Projeto em fase de planejamento
- **Em Andamento**: Projeto ativo
- **Concluído**: Projeto finalizado
- **Suspenso**: Projeto temporariamente parado

#### Categorias
- Educação
- Saúde
- Meio Ambiente
- Assistência Social
- Cultura
- Direitos Humanos

### 5. Sistema de Aportes

#### Tipos de Investidores
- Pessoa Física
- Pessoa Jurídica
- Governo
- Organismo Internacional

#### Regras
- Aportes vinculados a projetos específicos
- Histórico completo de contribuições
- Relatórios financeiros por projeto

### 6. Triggers e Automações

#### Atualização Automática de IDH
```sql
-- Trigger que recalcula IDH quando beneficiários são modificados
CREATE TRIGGER trigger_update_community_idh 
    AFTER INSERT OR UPDATE OR DELETE ON pessoas 
    FOR EACH ROW EXECUTE FUNCTION update_community_idh();
```

#### Timestamps Automáticos
- Todas as tabelas têm `created_at` e `updated_at`
- Atualização automática via triggers

### 7. Segurança e Privacidade

#### Row Level Security (RLS)
- Políticas implementadas em todas as tabelas
- Usuários só acessam dados de sua ONG
- Admin Global tem acesso irrestrito

#### Validação de Dados
- Schemas Zod para validação frontend
- Constraints de banco para integridade
- Sanitização de inputs

### 8. Sistema de Evolução e Acompanhamento

#### Evolução de Projetos
- **Tabela**: `evolucao_projeto`
- **Campos**: observações, status anterior/atual, marcos alcançados, desafios, próximos passos
- **Triggers**: Atualização automática de timestamps
- **RLS**: Acesso baseado na ONG do usuário
- **Funcionalidades**: Histórico completo de evolução, comparação de status

#### Evolução de Pessoas
- **Tabela**: `evolucao_pessoa`
- **Campos**: indicadores de saúde (peso, altura, IMC), progresso educacional, mudanças socioeconômicas
- **Cálculos Automáticos**: IMC baseado em peso e altura
- **Triggers**: Atualização automática do IDH da comunidade quando há mudanças significativas
- **Integração**: Atualiza dados principais da pessoa automaticamente

#### Impacto no IDH
- Evolução de pessoas pode atualizar automaticamente o IDH da comunidade
- Recálculo baseado em mudanças de escolaridade, renda e indicadores de saúde
- Histórico completo de mudanças para análise de impacto

### 9. Onboarding de Usuários

#### Fluxo para Novos Usuários
1. Cadastro via Supabase Auth
2. Criação de perfil na tabela `usuarios`
3. Vinculação a uma ONG (se não for Admin Global)
4. Setup inicial de comunidades (modal obrigatório)
5. Acesso ao dashboard principal

#### Configuração Inicial
- Modal de cadastro de comunidade para novos usuários
- Verificação de setup completo no dashboard
- Indicadores visuais de progresso no dashboard
- Cards de status de configuração com badges visuais

---

## Próximos Passos Sugeridos

1. **Implementação de Relatórios**: Sistema de geração de PDFs com métricas de evolução
2. **Dashboard Analytics**: Gráficos interativos com Chart.js ou Recharts
3. **Notificações**: Sistema de alertas para marcos de projetos
4. **API Externa**: Integração com dados do IBGE para IDH oficial
5. **Mobile App**: PWA ou React Native
6. **Backup Automático**: Integração com AWS S3 ou similar
7. **Auditoria Avançada**: Log detalhado de todas as operações CRUD
8. **Análise de Impacto**: Comparação de IDH antes/depois dos projetos
9. **Gamificação**: Sistema de conquistas para beneficiários
10. **Integração WhatsApp**: Notificações via API do WhatsApp Business

---

## Análise Técnica Avançada

### Componentes Principais Identificados

#### Forms (9 componentes especializados)
- **AportesForm.tsx**: Gestão de contribuições financeiras com validação de valores
- **CommunityForm.tsx**: Cadastro de comunidades com cálculo automático de IDH
- **InvestorForm.tsx**: Gestão de investidores com validação de documentos (CPF/CNPJ)
- **PeopleForm.tsx**: Cadastro de beneficiários com indicadores de saúde (IMC automático)
- **ProjectForm.tsx**: Gestão de projetos com categorização e orçamento
- **ProjectEvolutionForm.tsx**: Registro de evolução de projetos com marcos e desafios
- **PersonEvolutionForm.tsx**: Registro de evolução de pessoas com indicadores de saúde e progresso
- **OngRegistrationForm.tsx**: Registro de organizações
- **CommunityRegistrationForm.tsx**: Setup inicial obrigatório para novos usuários

#### Layout Responsivo (4 componentes)
- **Layout.tsx**: Layout principal da aplicação com responsividade automática
- **Sidebar.tsx**: Navegação lateral colapsável com persistência no localStorage
- **BottomBar.tsx**: Navegação inferior para dispositivos móveis
- **Navbar.tsx**: Componente de navegação adaptativo (deprecated - substituído pelo Layout)

#### Páginas CRUD Completas (9 páginas)
- **Dashboard.tsx**: Painel principal com métricas e indicadores
- **Communities.tsx**: CRUD completo de comunidades
- **Projects.tsx**: CRUD completo de projetos
- **People.tsx**: CRUD completo de pessoas/beneficiários
- **Investors.tsx**: CRUD completo de investidores
- **Aportes.tsx**: CRUD completo de contribuições financeiras
- **ProjectEvolution.tsx**: CRUD completo de evolução de projetos
- **PersonEvolution.tsx**: CRUD completo de evolução de pessoas
- **Admin.tsx**: Painel administrativo global

### Funcionalidades Avançadas Implementadas

#### Sistema de Permissões Granular
```sql
{{ ... }}
CREATE FUNCTION get_user_role() RETURNS user_role;
CREATE FUNCTION get_user_ong() RETURNS UUID;
CREATE FUNCTION can_access_ong(ong_id UUID) RETURNS BOOLEAN;
CREATE FUNCTION can_access_financial_data() RETURNS BOOLEAN;
```

#### Auditoria e Logging
- Triggers automáticos para log de acesso a dados sensíveis
- Função `log_sensitive_access()` para auditoria completa
- Políticas RLS específicas por tipo de usuário

#### Cálculo IDH Automatizado
- Função `calculate_community_idh()` com fórmula matemática complexa
- Trigger `update_community_idh()` para recálculo automático
- Três dimensões: Longevidade, Educação, Renda (média geométrica)

### Padrões de Código Identificados

#### Validação Schema-First
- Schemas Zod reutilizáveis para todos os formulários
- Validação client-side e server-side consistente
- Tipos TypeScript gerados automaticamente

#### Error Handling Padronizado
- Toast notifications consistentes
- Try-catch blocks com feedback visual
- Loading states padronizados

#### Performance Optimizations
- **Lazy loading**: Componentes carregados sob demanda
- **React Query**: Cache inteligente com invalidação automática
- **Database Indexes**: Otimizados para queries frequentes
  ```sql
  CREATE INDEX idx_evolucao_projeto_data_registro ON public.evolucao_projeto(data_registro DESC);
  CREATE INDEX idx_evolucao_pessoa_id_pessoa ON public.evolucao_pessoa(id_pessoa);
  ```
- **Componentes memoizados**: Prevenção de re-renders desnecessários
- **Parallel queries**: Múltiplas queries executadas simultaneamente no dashboard
- **Responsive design**: Layout adaptativo sem JavaScript adicional
- **LocalStorage persistence**: Estado da sidebar mantido entre sessões

---

## Estatísticas da Codebase

### Arquivos Analisados
- **13 migrações SQL** com schema completo do banco
- **9 formulários especializados** com validação Zod
- **9 páginas CRUD completas** com funcionalidades avançadas
- **4 componentes de layout** responsivos
- **Sistema de cores** com 40+ variáveis CSS customizadas
- **2 sistemas de evolução** (projetos e pessoas) com triggers automáticos

### Métricas de Código
- **Frontend**: React 18.3.1 + TypeScript
- **Componentes UI**: 50+ componentes shadcn/ui
- **Validação**: Schemas Zod para todos os formulários
- **Estado**: TanStack Query para cache inteligente
- **Estilização**: Tailwind CSS com design system customizado
- **Backend**: Supabase com PostgreSQL e Row Level Security
- **Autenticação**: Supabase Auth com perfis customizados

### Funcionalidades Implementadas
- ✅ **CRUD Completo**: 7 entidades principais
- ✅ **Sistema de Evolução**: Acompanhamento de projetos e pessoas
- ✅ **Cálculo Automático de IDH**: Baseado em dados reais
- ✅ **Dashboard Interativo**: Métricas em tempo real
- ✅ **Layout Responsivo**: Desktop e mobile
- ✅ **Sistema de Permissões**: RLS com 3 níveis de acesso
- ✅ **Validação Robusta**: Frontend e backend
- ✅ **Auditoria Básica**: Timestamps e usuário responsável

---

*Documentação atualizada em: 31/08/2025 às 03:49*
*Versão da aplicação: 1.0.0*
*Desenvolvido para CreateHack - Grupo 17*
*Análise técnica completa e profunda realizada*
*Total de linhas analisadas: 2000+ linhas de código*
