import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da plataforma",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  // If user is logged in, show minimal header
  if (user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">ONG Harmony</span>
                <span className="text-xs text-muted-foreground leading-none">Dashboard</span>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default header for non-authenticated users (simplified)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">ONG Harmony</span>
              <span className="text-xs text-muted-foreground leading-none">Gestão & Impacto</span>
            </div>
          </div>

          {/* Simple branding text */}
          <div className="hidden sm:block">
            <span className="text-sm text-muted-foreground">
              Plataforma de gestão para ONGs
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;