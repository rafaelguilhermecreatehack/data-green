import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoginForm from "@/components/auth/LoginForm";
import OngRegistrationForm from "@/components/forms/OngRegistrationForm";

const HeroSection = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary/5 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute top-10 right-10 w-48 h-48 bg-green-500/3 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/3 rounded-full blur-xl animate-pulse delay-1500"></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-primary/20 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-accent/20 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-32 left-16 w-5 h-5 bg-secondary/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-primary/30 rounded-full animate-bounce delay-200"></div>
        <div className="absolute top-32 left-1/2 w-2 h-2 bg-green-500/25 rounded-full animate-bounce delay-800"></div>
        <div className="absolute bottom-48 right-1/4 w-4 h-4 bg-blue-500/20 rounded-full animate-bounce delay-1300"></div>
        
        {/* Rotating Squares and Diamonds */}
        <div className="absolute top-60 left-1/3 w-8 h-8 bg-accent/15 rotate-45 animate-spin delay-500" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-6 h-6 bg-secondary/15 rotate-45 animate-spin delay-1200" style={{animationDuration: '10s'}}></div>
        <div className="absolute top-80 right-1/2 w-5 h-5 bg-primary/12 rotate-45 animate-spin delay-300" style={{animationDuration: '12s'}}></div>
        <div className="absolute bottom-60 left-1/4 w-7 h-7 bg-green-500/10 rotate-45 animate-spin delay-900" style={{animationDuration: '15s'}}></div>
        
        {/* Floating Triangles */}
        <div className="absolute top-24 right-1/3 w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-primary/15 animate-bounce delay-600" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-24 left-1/3 w-0 h-0 border-l-3 border-r-3 border-b-5 border-transparent border-b-accent/15 animate-bounce delay-1100" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-1/3 left-12 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-secondary/20 animate-bounce delay-400" style={{animationDuration: '2.5s'}}></div>
        
        {/* Moving Particles */}
        <div className="absolute top-16 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-ping delay-100"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent/30 rounded-full animate-ping delay-800"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-secondary/30 rounded-full animate-ping delay-1400"></div>
        <div className="absolute bottom-16 right-1/3 w-1 h-1 bg-green-500/30 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-2/3 left-1/2 w-1 h-1 bg-blue-500/30 rounded-full animate-ping delay-1100"></div>
        
        {/* Gradient Lines and Waves */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-pulse delay-500"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/8 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/8 to-transparent animate-pulse delay-1500"></div>
        
        {/* Vertical Gradient Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/8 to-transparent animate-pulse delay-700"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/8 to-transparent animate-pulse delay-1200"></div>
        
        {/* Floating Icons/Symbols */}
        <div className="absolute top-28 left-1/5 text-primary/10 animate-bounce delay-900" style={{animationDuration: '4s'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="absolute bottom-28 right-1/5 text-accent/10 animate-bounce delay-1300" style={{animationDuration: '3.5s'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="absolute top-2/3 right-12 text-secondary/10 animate-bounce delay-600" style={{animationDuration: '5s'}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
          </svg>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        {/* Hero Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Data Green
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