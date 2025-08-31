import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OngRegistrationForm } from "@/components/admin/OngRegistrationForm";
import { UserRegistrationForm } from "@/components/admin/UserRegistrationForm";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import Header from "@/components/layout/Header";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getSessionAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/");
          return;
        }

        setUser(session.user);

        // Get user role
        const { data: userData, error } = await supabase
          .from("usuarios")
          .select("papel")
          .eq("user_id", session.user.id)
          .single();

        if (error || !userData) {
          toast({
            title: "Acesso negado",
            description: "Usuário não encontrado no sistema.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        if (userData.papel !== "admin_global") {
          toast({
            title: "Acesso negado",
            description: "Apenas administradores globais podem acessar esta área.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setUserRole(userData.papel);
      } catch (error) {
        console.error("Error checking user role:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    getSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || userRole !== "admin_global") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Painel Administrativo Data Green
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie ONGs e usuários do sistema
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="register-ong">Cadastrar ONG</TabsTrigger>
            <TabsTrigger value="register-user">Cadastrar Usuário</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral do Sistema</CardTitle>
                <CardDescription>
                  Estatísticas e dados gerais das ONGs e usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register-ong">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Nova ONG</CardTitle>
                <CardDescription>
                  Registre uma nova organização no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OngRegistrationForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register-user">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Usuário Master</CardTitle>
                <CardDescription>
                  Crie um usuário master para uma ONG existente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserRegistrationForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;