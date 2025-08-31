import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Globe, Shield } from "lucide-react";
import heroImage from "@/assets/hero-ong-harmony.jpg";

const HeroSection = () => {
  const features = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Dashboards Inteligentes",
      description: "Visualize o impacto social em tempo real"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Gestão de Beneficiários",
      description: "Acompanhe a evolução das comunidades"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Mapeamento Geográfico",
      description: "IDH calculado automaticamente"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Controle de Acesso",
      description: "RBAC para diferentes níveis de usuário"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Transforme o{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Impacto Social
                </span>{" "}
                da sua ONG
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Plataforma completa para gestão de ONGs, projetos, comunidades e investidores. 
                Monitore o progresso, calcule o IDH automaticamente e gere relatórios profissionais.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Começar Agora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Ver Demonstração
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">ONGs Ativas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Beneficiários</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">R$ 2M+</p>
                <p className="text-sm text-muted-foreground">Aportes Gerenciados</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img
                src={heroImage}
                alt="Plataforma ONG Harmony - Gestão de Impacto Social"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
            </div>
            
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-elegant">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm">IDH Melhorou</p>
                  <p className="text-xs text-muted-foreground">+15% este mês</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;