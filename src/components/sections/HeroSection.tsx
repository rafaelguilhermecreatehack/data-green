import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoginForm from "@/components/auth/LoginForm";
import OngRegistrationForm from "@/components/forms/OngRegistrationForm";

const HeroSection = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            ONG Harmony
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Plataforma de gestão e monitoramento para ONGs comprometidas com o desenvolvimento social
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto">
                Entrar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
              </DialogHeader>
              <LoginForm onSuccess={() => setIsLoginOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Cadastrar ONG
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastro de ONG</DialogTitle>
              </DialogHeader>
              <OngRegistrationForm onSuccess={() => setIsRegisterOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-muted-foreground mt-8">
          <p>
            Gerencie projetos, monitore impacto social e conecte-se com investidores
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;