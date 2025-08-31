import { Building2, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const links = {
    platform: [
      { name: "Funcionalidades", href: "#features" },
      { name: "Preços", href: "#pricing" },
      { name: "Documentação", href: "#docs" },
      { name: "API", href: "#api" }
    ],
    support: [
      { name: "Central de Ajuda", href: "#help" },
      { name: "Contato", href: "#contact" },
      { name: "Suporte Técnico", href: "#support" },
      { name: "Status", href: "#status" }
    ],
    legal: [
      { name: "Termos de Uso", href: "#terms" },
      { name: "Política de Privacidade", href: "#privacy" },
      { name: "LGPD", href: "#lgpd" },
      { name: "Cookies", href: "#cookies" }
    ]
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">ONG Harmony</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Plataforma completa para gestão de ONGs, projetos sociais e monitoramento de impacto. 
              Transformando dados em mudança social real.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>contato@ongharmony.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>(11) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              {links.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 ONG Harmony. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Feito com ❤️ para o terceiro setor brasileiro
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;