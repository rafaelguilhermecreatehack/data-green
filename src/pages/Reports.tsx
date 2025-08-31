import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, BarChart3, Calendar, Users, Target } from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Relatórios
              </h1>
              <p className="text-muted-foreground text-lg">
                Gere relatórios detalhados para análise de impacto e transparência organizacional.
              </p>
            </div>
          </div>

          {/* Main Reports */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => navigate('/annual-report')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Relatório Anual</CardTitle>
                    <CardDescription className="text-base">
                      Relatório completo de atividades e transparência
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gere um relatório anual completo com dados organizacionais, financeiros e de impacto social. 
                  Ideal para prestação de contas e transparência com stakeholders.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1 text-xs bg-blue-50 px-2 py-1 rounded">
                    <Users className="h-3 w-3" />
                    <span>Pessoas</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs bg-green-50 px-2 py-1 rounded">
                    <BarChart3 className="h-3 w-3" />
                    <span>Estatísticas</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs bg-purple-50 px-2 py-1 rounded">
                    <Calendar className="h-3 w-3" />
                    <span>Anual</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => navigate('/strategic-report')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Relatório Estratégico</CardTitle>
                    <CardDescription className="text-base">
                      Análise estratégica para investidores e stakeholders
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Relatório focado em métricas de performance, análise de impacto e insights estratégicos. 
                  Perfeito para apresentações a investidores e tomada de decisões.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1 text-xs bg-green-50 px-2 py-1 rounded">
                    <Target className="h-3 w-3" />
                    <span>KPIs</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs bg-blue-50 px-2 py-1 rounded">
                    <TrendingUp className="h-3 w-3" />
                    <span>Evolução</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs bg-orange-50 px-2 py-1 rounded">
                    <BarChart3 className="h-3 w-3" />
                    <span>Análises</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information Section */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Relatório Anual</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Dados organizacionais completos
                </p>
                <p className="text-sm text-muted-foreground">
                  • Informações financeiras
                </p>
                <p className="text-sm text-muted-foreground">
                  • Estatísticas de beneficiários
                </p>
                <p className="text-sm text-muted-foreground">
                  • Transparência e governança
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Relatório Estratégico</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Métricas de performance
                </p>
                <p className="text-sm text-muted-foreground">
                  • Análise de evolução
                </p>
                <p className="text-sm text-muted-foreground">
                  • Insights estratégicos
                </p>
                <p className="text-sm text-muted-foreground">
                  • Recomendações de crescimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Formatos Disponíveis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • PDF profissional
                </p>
                <p className="text-sm text-muted-foreground">
                  • Dados em tempo real
                </p>
                <p className="text-sm text-muted-foreground">
                  • Gráficos e tabelas
                </p>
                <p className="text-sm text-muted-foreground">
                  • Configuração personalizada
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
