import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  Shield,
  Building2,
  Target
} from "lucide-react";

const FeaturesSection = () => {
  const modules = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Gestão de ONGs",
      description: "Cadastro completo com CNPJ, categoria, receita anual e estrutura organizacional",
      features: ["Perfis institucionais", "Documentação legal", "Equipe de gestão"]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Controle de Usuários",
      description: "Sistema RBAC com Admin Global, Master ONG e Colaboradores",
      features: ["Papéis e permissões", "Hierarquia de acesso", "Auditoria de ações"]
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Mapeamento de Comunidades",
      description: "Cadastro geográfico com cálculo automático de IDH baseado em dados reais",
      features: ["Localização GPS", "IDH automático", "Indicadores sociais"]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Gestão de Projetos",
      description: "Ciclo completo desde planejamento até execução e monitoramento",
      features: ["Cronogramas", "Metas e KPIs", "Acompanhamento de progresso"]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Cadastro de Pessoas",
      description: "Perfis detalhados com indicadores de saúde, educação e renda",
      features: ["Dados demográficos", "Histórico familiar", "Evolução pessoal"]
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Gestão de Investidores",
      description: "Controle de aportes financeiros e relacionamento com doadores",
      features: ["Base de investidores", "Histórico de doações", "Prestação de contas"]
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Dashboards e Analytics",
      description: "Visualizações interativas do impacto social e financeiro",
      features: ["Gráficos dinâmicos", "Métricas de impacto", "Comparativos temporais"]
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Relatórios Avançados",
      description: "Exportação em PDF/Excel com filtros personalizáveis",
      features: ["Templates profissionais", "Filtros avançados", "Agendamento automático"]
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Plataforma Completa para
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Impacto Social</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todos os módulos integrados para uma gestão eficiente e transparente do terceiro setor
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {module.icon}
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-hero rounded-2xl p-8 lg:p-12 text-primary-foreground">
            <div className="max-w-3xl mx-auto space-y-6">
              <h3 className="text-2xl lg:text-3xl font-bold">
                Pronto para revolucionar a gestão da sua ONG?
              </h3>
              <p className="text-lg opacity-90">
                Conecte-se ao Supabase e comece a usar todas as funcionalidades da plataforma
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg">
                  Conectar ao Supabase
                </Button>
                <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Agendar Demonstração
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;