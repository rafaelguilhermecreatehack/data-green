import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
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
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {user.email}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards for dashboard content */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">Projetos Ativos</h3>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">
                Nenhum projeto encontrado
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">Beneficiários</h3>
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">
                Total de pessoas atendidas
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-2">Aportes Recebidos</h3>
              <p className="text-3xl font-bold text-primary">R$ 0</p>
              <p className="text-sm text-muted-foreground">
                Total de investimentos
              </p>
            </div>
          </div>

          <div className="mt-8 bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Configuração da Conta</h2>
            <p className="text-muted-foreground mb-4">
              Seu acesso foi criado com sucesso! Para começar a usar a plataforma, 
              é necessário que nossa equipe configure sua ONG no sistema.
            </p>
            <p className="text-sm text-muted-foreground">
              Nossa equipe entrará em contato em breve para finalizar a configuração.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;