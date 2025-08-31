import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CommunityRegistrationForm from "@/components/forms/CommunityRegistrationForm";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsCommunitySetup, setNeedsCommunitySetup] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  const handleCommunitySetupComplete = () => {
    setNeedsCommunitySetup(false);
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Bem-vindo ao Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Olá, {user.email}! {userProfile?.papel === 'admin_global' 
                ? 'Gerencie todos os aspectos da plataforma.' 
                : 'Aqui você pode gerenciar todos os aspectos da sua organização.'}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Projetos Ativos
                </CardTitle>
                <Badge variant="secondary">0</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Nenhum projeto cadastrado ainda
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Beneficiários
                </CardTitle>
                <Badge variant="secondary">0</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Pessoas impactadas pelos projetos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aportes Recebidos
                </CardTitle>
                <Badge variant="secondary">R$ 0</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">
                  Total de investimentos recebidos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Account Setup Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status da Configuração da Conta</CardTitle>
              <CardDescription>
                Complete as configurações para começar a usar a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Conta criada</span>
                <Badge variant="default">✓ Concluído</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cadastro de comunidades</span>
                <Badge variant={needsCommunitySetup ? "secondary" : "default"}>
                  {needsCommunitySetup ? "Pendente" : "✓ Concluído"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Primeiro projeto</span>
                <Badge variant="secondary">Pendente</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cadastro de beneficiários</span>
                <Badge variant="secondary">Pendente</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {needsCommunitySetup 
                  ? "Complete o cadastro de comunidades para continuar com os próximos passos."
                  : "Complete os próximos passos para começar a gerenciar seus projetos e acompanhar o impacto social."}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Community Setup Modal */}
      <Dialog open={needsCommunitySetup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Configuração Inicial</DialogTitle>
          </DialogHeader>
          <CommunityRegistrationForm onSuccess={handleCommunitySetupComplete} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;