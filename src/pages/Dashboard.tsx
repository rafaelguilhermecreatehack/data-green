import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Users, Building, TrendingUp, FolderOpen, User, DollarSign, BarChart3, Activity, MapPin, Target, Calendar, AlertCircle, FileText } from "lucide-react";
import CommunityRegistrationForm from "@/components/forms/CommunityRegistrationForm";
import { MapboxMap } from "@/components/maps/MapboxMap";

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  totalPeople: number;
  totalCommunities: number;
  totalInvestors: number;
  totalContributions: number;
  totalContributionValue: number;
  projectsByStatus: { [key: string]: number };
  recentProjects: any[];
  topCommunities: any[];
  monthlyContributions: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsCommunitySetup, setNeedsCommunitySetup] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    totalPeople: 0,
    totalCommunities: 0,
    totalInvestors: 0,
    totalContributions: 0,
    totalContributionValue: 0,
    projectsByStatus: {},
    recentProjects: [],
    topCommunities: [],
    monthlyContributions: 0
  });
  const navigate = useNavigate();

  const handleCommunitySetupComplete = () => {
    setNeedsCommunitySetup(false);
    fetchDashboardMetrics();
  };

  const fetchDashboardMetrics = async () => {
    try {
      // Fetch all metrics in parallel
      const [projectsRes, peopleRes, communitiesRes, investorsRes, contributionsRes] = await Promise.all([
        supabase.from('projetos').select('*, comunidades(cidade, estado)', { count: 'exact' }),
        supabase.from('pessoas').select('*', { count: 'exact' }),
        supabase.from('comunidades').select('*, projetos(id)', { count: 'exact' }),
        supabase.from('investidores').select('*', { count: 'exact' }),
        supabase.from('aportes').select('*, projetos(nome_projeto), investidores(nome_investidor)')
      ]);

      const projects = projectsRes.data || [];
      const people = peopleRes.data || [];
      const communities = communitiesRes.data || [];
      const investors = investorsRes.data || [];
      const contributions = contributionsRes.data || [];

      // Calculate project status distribution
      const projectsByStatus = projects.reduce((acc: any, project: any) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {});

      // Calculate total contribution value
      const totalContributionValue = contributions.reduce((sum: number, contrib: any) => {
        return sum + (parseFloat(contrib.valor_aporte) || 0);
      }, 0);

      // Get monthly contributions (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyContributions = contributions.filter((contrib: any) => {
        const contribDate = new Date(contrib.data_aporte);
        return contribDate.getMonth() === currentMonth && contribDate.getFullYear() === currentYear;
      }).length;

      // Get recent projects (last 5)
      const recentProjects = projects
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      // Get top communities by project count
      const topCommunities = communities
        .map((community: any) => ({
          ...community,
          projectCount: community.projetos?.length || 0
        }))
        .sort((a: any, b: any) => b.projectCount - a.projectCount)
        .slice(0, 5);

      setMetrics({
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'em_andamento').length,
        totalPeople: people.length,
        totalCommunities: communities.length,
        totalInvestors: investors.length,
        totalContributions: contributions.length,
        totalContributionValue,
        projectsByStatus,
        recentProjects,
        topCommunities,
        monthlyContributions
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate("/");
          return;
        }

        setUser(session.user);

        // Get user profile to check role
        const { data: profile } = await supabase
          .from("usuarios")
          .select("*, ongs(*)")
          .eq("user_id", session.user.id)
          .single();

        setUserProfile(profile);

        // Check if user needs community setup (only for non-admin users)
        if (profile?.papel !== 'admin_global') {
          const { data: communities, error } = await supabase
            .from("comunidades")
            .select("id")
            .limit(1);

          if (!error && communities && communities.length === 0) {
            setNeedsCommunitySetup(true);
          }
        }

        // Fetch dashboard metrics
        await fetchDashboardMetrics();
      } catch (error) {
        console.error("Dashboard initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/");
        } else if (event === 'SIGNED_OUT') {
          navigate("/");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Dashboard - Data Green
              </h1>
              <p className="text-muted-foreground text-lg">
                Olá, {user.email}! {userProfile?.papel === 'admin_global' 
                  ? 'Visão geral completa da plataforma.' 
                  : 'Acompanhe o impacto social da sua organização.'}
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Projetos Totais
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.activeProjects} em andamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Beneficiários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalPeople}</div>
                <p className="text-xs text-muted-foreground">
                  Pessoas impactadas pelos projetos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Comunidades
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCommunities}</div>
                <p className="text-xs text-muted-foreground">
                  Locais de atuação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aportes Recebidos
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(metrics.totalContributionValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalContributions} contribuições
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Map */}
          <div className="grid gap-6">
            <MapboxMap height="500px" />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/communities')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gerenciar Comunidades
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Cadastrar e gerenciar comunidades
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/projects')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gerenciar Projetos
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Criar e acompanhar projetos
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/project-evolution')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Evolução de Projetos
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Acompanhar progresso dos projetos
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/annual-report')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Relatório Anual
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Gerar relatório anual em PDF
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Investidores
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalInvestors}</div>
                <p className="text-xs text-muted-foreground">
                  Parceiros financeiros
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aportes Este Mês
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.monthlyContributions}</div>
                <p className="text-xs text-muted-foreground">
                  Contribuições recentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Sucesso
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalProjects > 0 
                    ? Math.round(((metrics.projectsByStatus.concluido || 0) / metrics.totalProjects) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Projetos concluídos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Project Status Distribution */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Projetos</CardTitle>
                <CardDescription>
                  Distribuição dos projetos por status atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(metrics.projectsByStatus).map(([status, count]) => {
                  const total = metrics.totalProjects;
                  const percentage = total > 0 ? (count as number / total) * 100 : 0;
                  const statusLabels: { [key: string]: string } = {
                    'planejamento': 'Planejamento',
                    'em_andamento': 'Em Andamento',
                    'concluido': 'Concluído',
                    'suspenso': 'Suspenso'
                  };
                  const statusColors: { [key: string]: string } = {
                    'planejamento': 'bg-yellow-500',
                    'em_andamento': 'bg-blue-500',
                    'concluido': 'bg-green-500',
                    'suspenso': 'bg-red-500'
                  };
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{statusLabels[status] || status}</span>
                        <span className="font-medium">{count} ({Math.round(percentage)}%)</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                      />
                    </div>
                  );
                })}
                {metrics.totalProjects === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum projeto cadastrado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuração da Conta</CardTitle>
                <CardDescription>
                  Status das configurações iniciais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conta criada</span>
                  <Badge variant="default">✓ Concluído</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Comunidades cadastradas</span>
                  <Badge variant={metrics.totalCommunities > 0 ? "default" : "secondary"}>
                    {metrics.totalCommunities > 0 ? "✓ Concluído" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Projetos criados</span>
                  <Badge variant={metrics.totalProjects > 0 ? "default" : "secondary"}>
                    {metrics.totalProjects > 0 ? "✓ Concluído" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Beneficiários cadastrados</span>
                  <Badge variant={metrics.totalPeople > 0 ? "default" : "secondary"}>
                    {metrics.totalPeople > 0 ? "✓ Concluído" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Investidores registrados</span>
                  <Badge variant={metrics.totalInvestors > 0 ? "default" : "secondary"}>
                    {metrics.totalInvestors > 0 ? "✓ Concluído" : "Pendente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          {metrics.recentProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Projetos Recentes</CardTitle>
                <CardDescription>
                  Últimos projetos criados na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.recentProjects.map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{project.nome_projeto}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.comunidades?.cidade}, {project.comunidades?.estado}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={project.status === 'em_andamento' ? 'default' : 'secondary'}>
                          {project.status === 'planejamento' && 'Planejamento'}
                          {project.status === 'em_andamento' && 'Em Andamento'}
                          {project.status === 'concluido' && 'Concluído'}
                          {project.status === 'suspenso' && 'Suspenso'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(project.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Communities */}
          {metrics.topCommunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Principais Comunidades</CardTitle>
                <CardDescription>
                  Comunidades com maior número de projetos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topCommunities.map((community: any) => (
                    <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{community.cidade}</p>
                          <p className="text-sm text-muted-foreground">
                            {community.bairro}, {community.estado}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{community.projectCount} projetos</p>
                        <p className="text-xs text-muted-foreground">
                          IDH: {community.idh?.toFixed(3) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Community Setup Modal */}
      <Dialog open={needsCommunitySetup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Configuração Inicial</DialogTitle>
          </DialogHeader>
          <CommunityRegistrationForm onSuccess={handleCommunitySetupComplete} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;