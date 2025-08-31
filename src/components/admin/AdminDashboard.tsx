import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Calendar, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalOngs: number;
  activeOngs: number;
  totalUsers: number;
  totalProjects: number;
}

interface RecentOng {
  id: string;
  nome_fantasia: string;
  categoria: string;
  ativa: boolean;
  created_at: string;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOngs: 0,
    activeOngs: 0,
    totalUsers: 0,
    totalProjects: 0,
  });
  const [recentOngs, setRecentOngs] = useState<RecentOng[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch ONGs stats
        const { data: ongsData } = await supabase
          .from("ongs")
          .select("id, ativa");

        const totalOngs = ongsData?.length || 0;
        const activeOngs = ongsData?.filter(ong => ong.ativa).length || 0;

        // Fetch users count
        const { data: usersData } = await supabase
          .from("usuarios")
          .select("id")
          .eq("ativo", true);

        const totalUsers = usersData?.length || 0;

        // Fetch projects count
        const { data: projectsData } = await supabase
          .from("projetos")
          .select("id");

        const totalProjects = projectsData?.length || 0;

        setStats({
          totalOngs,
          activeOngs,
          totalUsers,
          totalProjects,
        });

        // Fetch recent ONGs
        const { data: recentOngsData } = await supabase
          .from("ongs")
          .select("id, nome_fantasia, categoria, ativa, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentOngs(recentOngsData || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de ONGs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOngs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeOngs} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Projetos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ativação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOngs > 0 ? Math.round((stats.activeOngs / stats.totalOngs) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              ONGs ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent ONGs */}
      <Card>
        <CardHeader>
          <CardTitle>ONGs Cadastradas Recentemente</CardTitle>
          <CardDescription>
            Últimas organizações registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentOngs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma ONG cadastrada ainda
            </p>
          ) : (
            <div className="space-y-4">
              {recentOngs.map((ong) => (
                <div
                  key={ong.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{ong.nome_fantasia}</p>
                    <p className="text-sm text-muted-foreground">
                      {ong.categoria.replace(/_/g, " ").toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cadastrada em {new Date(ong.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={ong.ativa ? "default" : "secondary"}>
                    {ong.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};