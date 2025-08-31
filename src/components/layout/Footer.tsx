import { Building2, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        {/* Brand Section */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Data Green</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Plataforma completa para gestão de ONGs, projetos sociais e monitoramento de impacto. 
            Transformando dados em mudança social real.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>contato@ongharmony.org</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>(11) 9999-9999</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>São Paulo, SP - Brasil</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 Data Green. Todos os direitos reservados.
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