import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StrategicReportForm from "@/components/forms/StrategicReportForm";
import { FileText, TrendingUp, Users, Building, DollarSign, Target, BarChart3, Activity } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface StrategicData {
  // Dashboard metrics
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalPeople: number;
  totalCommunities: number;
  totalInvestors: number;
  totalContributions: number;
  totalContributionValue: number;
  projectsByStatus: { [key: string]: number };
  projectsByCategory: { [key: string]: number };
  
  // Evolution data
  projectEvolutions: any[];
  personEvolutions: any[];
  
  // Financial analysis
  monthlyContributions: { month: string; value: number; count: number }[];
  investorsByType: { [key: string]: number };
  avgContributionPerProject: number;
  
  // Strategic insights
  successRate: number;
  avgProjectDuration: number;
  topPerformingCommunities: any[];
  impactMetrics: {
    educationProgress: number;
    healthImprovements: number;
    incomeImprovements: number;
  };
}

const StrategicReport = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [strategicData, setStrategicData] = useState<StrategicData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchStrategicData = async (startDate?: Date, endDate?: Date) => {
    try {
      const dateFilter = startDate && endDate ? {
        gte: startDate.toISOString(),
        lte: endDate.toISOString()
      } : {};

      // Fetch all data in parallel
      const [
        projectsRes,
        peopleRes,
        communitiesRes,
        investorsRes,
        contributionsRes,
        projectEvolutionsRes,
        personEvolutionsRes
      ] = await Promise.all([
        supabase.from('projetos').select('*, comunidades(cidade, estado, idh)'),
        supabase.from('pessoas').select('*'),
        supabase.from('comunidades').select('*, projetos(id)'),
        supabase.from('investidores').select('*'),
        supabase.from('aportes').select('*, projetos(nome_projeto), investidores(nome_investidor, tipo_investidor)'),
        supabase.from('evolucao_projeto').select('*, projetos(nome_projeto, status)').order('data_registro', { ascending: false }),
        supabase.from('evolucao_pessoa').select('*, pessoas(nome_completo)').order('data_registro', { ascending: false })
      ]);

      const projects = projectsRes.data || [];
      const people = peopleRes.data || [];
      const communities = communitiesRes.data || [];
      const investors = investorsRes.data || [];
      const contributions = contributionsRes.data || [];
      const projectEvolutions = projectEvolutionsRes.data || [];
      const personEvolutions = personEvolutionsRes.data || [];

      // Calculate metrics
      const projectsByStatus = projects.reduce((acc: any, project: any) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {});

      const projectsByCategory = projects.reduce((acc: any, project: any) => {
        acc[project.categoria] = (acc[project.categoria] || 0) + 1;
        return acc;
      }, {});

      const investorsByType = investors.reduce((acc: any, investor: any) => {
        acc[investor.tipo_investidor] = (acc[investor.tipo_investidor] || 0) + 1;
        return acc;
      }, {});

      const totalContributionValue = contributions.reduce((sum: number, contrib: any) => {
        return sum + (parseFloat(contrib.valor_aporte) || 0);
      }, 0);

      const avgContributionPerProject = projects.length > 0 ? totalContributionValue / projects.length : 0;
      const successRate = projects.length > 0 ? ((projectsByStatus.concluido || 0) / projects.length) * 100 : 0;

      // Calculate monthly contributions
      const monthlyContributions = contributions.reduce((acc: any, contrib: any) => {
        const month = new Date(contrib.data_aporte).toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (!acc[month]) {
          acc[month] = { value: 0, count: 0 };
        }
        acc[month].value += parseFloat(contrib.valor_aporte) || 0;
        acc[month].count += 1;
        return acc;
      }, {});

      const monthlyContributionsArray = Object.entries(monthlyContributions).map(([month, data]: [string, any]) => ({
        month,
        value: data.value,
        count: data.count
      }));

      // Top performing communities
      const topPerformingCommunities = communities
        .map((community: any) => ({
          ...community,
          projectCount: community.projetos?.length || 0
        }))
        .sort((a: any, b: any) => b.projectCount - a.projectCount)
        .slice(0, 5);

      // Impact metrics from person evolutions
      const impactMetrics = {
        educationProgress: personEvolutions.filter(pe => pe.nivel_escolaridade_atual && pe.nivel_escolaridade_anterior).length,
        healthImprovements: personEvolutions.filter(pe => pe.melhorias_saude).length,
        incomeImprovements: personEvolutions.filter(pe => pe.faixa_renda_atual && pe.faixa_renda_anterior).length
      };

      setStrategicData({
        totalProjects: projects.length,
        activeProjects: projectsByStatus.em_andamento || 0,
        completedProjects: projectsByStatus.concluido || 0,
        totalPeople: people.length,
        totalCommunities: communities.length,
        totalInvestors: investors.length,
        totalContributions: contributions.length,
        totalContributionValue,
        projectsByStatus,
        projectsByCategory,
        projectEvolutions: projectEvolutions.slice(0, 10),
        personEvolutions: personEvolutions.slice(0, 10),
        monthlyContributions: monthlyContributionsArray,
        investorsByType,
        avgContributionPerProject,
        successRate,
        avgProjectDuration: 0, // Could be calculated from project dates
        topPerformingCommunities,
        impactMetrics
      });

    } catch (error) {
      console.error('Error fetching strategic data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados estratégicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategicData();
  }, []);

  const generateStrategicPDF = async (formData: any) => {
    if (!strategicData) return;

    setGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let yPosition = 20;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Title page
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Relatório Estratégico", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      pdf.setFontSize(18);
      pdf.text(formData.nomeOrganizacao, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const periodo = `${formData.dataInicio.toLocaleDateString('pt-BR')} - ${formData.dataFim.toLocaleDateString('pt-BR')}`;
      pdf.text(`Período: ${periodo}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 30;

      // Executive Summary
      if (formData.incluirDashboard) {
        checkPageBreak(60);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Resumo Executivo", 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        const summaryData = [
          ['Métrica', 'Valor', 'Impacto'],
          ['Projetos Totais', strategicData.totalProjects.toString(), 'Base de atuação'],
          ['Projetos Ativos', strategicData.activeProjects.toString(), 'Execução atual'],
          ['Taxa de Sucesso', `${strategicData.successRate.toFixed(1)}%`, 'Efetividade'],
          ['Pessoas', strategicData.totalPeople.toString(), 'Alcance social'],
          ['Comunidades', strategicData.totalCommunities.toString(), 'Cobertura territorial'],
          ['Investidores', strategicData.totalInvestors.toString(), 'Base de apoio'],
          ['Aportes Totais', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(strategicData.totalContributionValue), 'Recursos mobilizados']
        ];

        autoTable(pdf, {
          head: [summaryData[0]],
          body: summaryData.slice(1),
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [34, 197, 94] },
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 20;
      }

      // Project Evolution Analysis
      if (formData.incluirEvolucaoProjetos && strategicData.projectEvolutions.length > 0) {
        checkPageBreak(80);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Evolução dos Projetos", 20, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Registros de evolução analisados: ${strategicData.projectEvolutions.length}`, 20, yPosition);
        yPosition += 10;

        const evolutionData = strategicData.projectEvolutions.slice(0, 5).map((evolution: any) => [
          evolution.projetos?.nome_projeto || 'N/A',
          new Date(evolution.data_registro).toLocaleDateString('pt-BR'),
          evolution.marcos_alcancados?.substring(0, 50) + '...' || 'N/A',
          evolution.status_atual || 'N/A'
        ]);

        autoTable(pdf, {
          head: [['Projeto', 'Data', 'Marcos Alcançados', 'Status']],
          body: evolutionData,
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 15;
      }

      // Financial Analysis
      if (formData.incluirAnaliseFinanceira) {
        checkPageBreak(60);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Análise Financeira", 20, yPosition);
        yPosition += 15;

        const financialData = [
          ['Indicador', 'Valor'],
          ['Total de Aportes', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(strategicData.totalContributionValue)],
          ['Número de Contribuições', strategicData.totalContributions.toString()],
          ['Média por Projeto', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(strategicData.avgContributionPerProject)],
          ['Investidores Ativos', strategicData.totalInvestors.toString()]
        ];

        autoTable(pdf, {
          head: [financialData[0]],
          body: financialData.slice(1),
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [168, 85, 247] },
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 15;
      }

      // Strategic Insights
      if (formData.incluirInsightsEstrategicos) {
        checkPageBreak(80);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Insights Estratégicos", 20, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        const insights = [
          `• Taxa de sucesso de ${strategicData.successRate.toFixed(1)}% demonstra efetividade na execução`,
          `• ${strategicData.totalPeople} beneficiários impactados diretamente pelos projetos`,
          `• Atuação em ${strategicData.totalCommunities} comunidades diferentes`,
          `• ${strategicData.impactMetrics.educationProgress} pessoas com progresso educacional registrado`,
          `• ${strategicData.impactMetrics.healthImprovements} melhorias de saúde documentadas`,
          `• ${strategicData.impactMetrics.incomeImprovements} casos de melhoria de renda familiar`
        ];

        insights.forEach(insight => {
          checkPageBreak(8);
          pdf.text(insight, 20, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }

      // Recommendations
      if (formData.incluirRecomendacoes) {
        checkPageBreak(60);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Recomendações Estratégicas", 20, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        const recommendations = [
          "• Expandir atuação para novas comunidades com base no sucesso atual",
          "• Implementar sistema de monitoramento contínuo de impacto",
          "• Diversificar base de investidores para sustentabilidade financeira",
          "• Desenvolver parcerias estratégicas com outras organizações",
          "• Criar programa de capacitação para beneficiários",
          "• Estabelecer métricas de longo prazo para avaliação de impacto"
        ];

        recommendations.forEach(rec => {
          checkPageBreak(8);
          pdf.text(rec, 20, yPosition);
          yPosition += 8;
        });
      }

      // Footer with organization info
      pdf.setFontSize(8);
      pdf.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} | ${formData.nomeOrganizacao}`, 20, 285);

      // Save PDF
      const fileName = `relatorio-estrategico-${formData.nomeOrganizacao.replace(/\s+/g, '-').toLowerCase()}-${new Date().getFullYear()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Relatório gerado com sucesso!",
        description: `O arquivo ${fileName} foi baixado`,
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setIsFormDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados estratégicos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: "Relatório Estratégico", current: true }]} />

        <PageHeader 
          title="Relatório Estratégico"
          description="Análise completa para apresentação a investidores e stakeholders"
        >
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configurar Relatório Estratégico</DialogTitle>
                <DialogDescription>
                  Configure as seções e informações que serão incluídas no relatório para investidores
                </DialogDescription>
              </DialogHeader>
              <StrategicReportForm onSubmit={generateStrategicPDF} loading={generating} />
            </DialogContent>
          </Dialog>
        </PageHeader>

        {strategicData && (
          <div className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{strategicData.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    de {strategicData.totalProjects} totais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{strategicData.successRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {strategicData.completedProjects} projetos concluídos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pessoas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{strategicData.totalPeople}</div>
                  <p className="text-xs text-muted-foreground">
                    Pessoas impactadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recursos Mobilizados</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact'
                    }).format(strategicData.totalContributionValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {strategicData.totalInvestors} investidores
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Evolution Highlights */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Evolução Recente - Projetos
                  </CardTitle>
                  <CardDescription>
                    Últimas atualizações de progresso dos projetos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {strategicData.projectEvolutions.slice(0, 3).map((evolution: any) => (
                      <div key={evolution.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{evolution.projetos?.nome_projeto}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(evolution.data_registro).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {evolution.status_atual || 'Em andamento'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Impacto nas Pessoas
                  </CardTitle>
                  <CardDescription>
                    Métricas de transformação social
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Progresso Educacional</span>
                      <Badge variant="secondary">{strategicData.impactMetrics.educationProgress}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Melhorias de Saúde</span>
                      <Badge variant="secondary">{strategicData.impactMetrics.healthImprovements}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Melhoria de Renda</span>
                      <Badge variant="secondary">{strategicData.impactMetrics.incomeImprovements}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Principais Comunidades de Atuação
                </CardTitle>
                <CardDescription>
                  Comunidades com maior concentração de projetos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {strategicData.topPerformingCommunities.map((community: any) => (
                    <div key={community.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{community.cidade}</h4>
                      <p className="text-sm text-muted-foreground">{community.bairro}, {community.estado}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline">{community.projectCount} projetos</Badge>
                        <span className="text-xs text-muted-foreground">
                          IDH: {community.idh?.toFixed(3) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StrategicReport;
