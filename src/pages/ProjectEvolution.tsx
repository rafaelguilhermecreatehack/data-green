import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProjectEvolutionForm from "@/components/forms/ProjectEvolutionForm";
import { Plus, Search, Edit, Trash2, Calendar, User, TrendingUp, AlertTriangle, Target } from "lucide-react";

interface ProjectEvolution {
  id: string;
  id_projeto: string;
  data_registro: string;
  observacoes: string;
  status_anterior?: string;
  status_atual?: string;
  marcos_alcancados?: string;
  desafios_enfrentados?: string;
  proximos_passos?: string;
  registrado_por: string;
  created_at: string;
  updated_at: string;
  projetos?: {
    nome_projeto: string;
    status: string;
  };
  usuarios?: {
    nome: string;
  };
}

const statusLabels = {
  planejamento: "Planejamento",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  suspenso: "Suspenso",
};

const statusColors = {
  planejamento: "bg-yellow-100 text-yellow-800 border-yellow-200",
  em_andamento: "bg-blue-100 text-blue-800 border-blue-200",
  concluido: "bg-green-100 text-green-800 border-green-200",
  suspenso: "bg-red-100 text-red-800 border-red-200",
};

const ProjectEvolution = () => {
  const [evolutions, setEvolutions] = useState<ProjectEvolution[]>([]);
  const [filteredEvolutions, setFilteredEvolutions] = useState<ProjectEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvolution, setEditingEvolution] = useState<ProjectEvolution | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchEvolutions = async () => {
    try {
      const { data, error } = await supabase
        .from("evolucao_projeto")
        .select(`
          *,
          projetos (
            nome_projeto,
            status
          ),
          usuarios (
            nome
          )
        `)
        .order("data_registro", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar evoluções",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setEvolutions(data || []);
      setFilteredEvolutions(data || []);
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvolutions();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEvolutions(evolutions);
    } else {
      const filtered = evolutions.filter(
        (evolution) =>
          evolution.projetos?.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evolution.observacoes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evolution.marcos_alcancados?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evolution.usuarios?.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvolutions(filtered);
    }
  }, [searchTerm, evolutions]);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchEvolutions();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingEvolution(null);
    fetchEvolutions();
  };

  const handleEdit = (evolution: ProjectEvolution) => {
    setEditingEvolution(evolution);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (evolutionId: string, projectName: string) => {
    try {
      const { error } = await supabase
        .from("evolucao_projeto")
        .delete()
        .eq("id", evolutionId);

      if (error) {
        toast({
          title: "Erro ao excluir evolução",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Evolução excluída com sucesso!",
        description: `Registro de evolução do projeto ${projectName} foi removido`,
      });

      fetchEvolutions();
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Evolução de Projetos", current: true }]} />

        {/* Header */}
        <PageHeader 
          title="Evolução de Projetos"
          description="Acompanhe o progresso e evolução dos projetos"
        >
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Evolução
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Evolução</DialogTitle>
              </DialogHeader>
              <ProjectEvolutionForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por projeto, observações, marcos ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Summary Badge */}
        {evolutions.length > 0 && (
          <div className="mb-6">
            <Badge variant="outline" className="text-sm px-3 py-1">
              Total de registros: {evolutions.length}
            </Badge>
          </div>
        )}

        {/* Evolutions Grid */}
        {filteredEvolutions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? "Nenhuma evolução encontrada" : "Nenhuma evolução registrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar os termos da sua busca"
                : "Comece registrando a primeira evolução de projeto"}
            </p>
            {!searchTerm && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primeira Evolução
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Evolução</DialogTitle>
                  </DialogHeader>
                  <ProjectEvolutionForm onSuccess={handleCreateSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvolutions.map((evolution) => (
              <Card key={evolution.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg line-clamp-1">
                      {evolution.projetos?.nome_projeto}
                    </CardTitle>
                    <div className="flex gap-2">
                      {evolution.status_atual && (
                        <Badge
                          className={`${
                            statusColors[evolution.status_atual as keyof typeof statusColors]
                          } text-xs`}
                        >
                          {statusLabels[evolution.status_atual as keyof typeof statusLabels]}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDateTime(evolution.data_registro)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Observações */}
                  <div>
                    <h4 className="font-medium text-sm mb-1">Observações</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {evolution.observacoes}
                    </p>
                  </div>

                  {/* Status Change */}
                  {evolution.status_anterior && evolution.status_atual && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {statusLabels[evolution.status_anterior as keyof typeof statusLabels]}
                      </Badge>
                      <span>→</span>
                      <Badge variant="outline" className="text-xs">
                        {statusLabels[evolution.status_atual as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  )}

                  {/* Marco Alcançado */}
                  {evolution.marcos_alcancados && (
                    <div className="flex items-start gap-2 text-sm">
                      <Target className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Marco:</span>
                        <p className="text-muted-foreground line-clamp-2">
                          {evolution.marcos_alcancados}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Desafios */}
                  {evolution.desafios_enfrentados && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Desafios:</span>
                        <p className="text-muted-foreground line-clamp-2">
                          {evolution.desafios_enfrentados}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Usuário */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Registrado por: {evolution.usuarios?.nome}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(evolution)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Evolução</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este registro de evolução do projeto "{evolution.projetos?.nome_projeto}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(evolution.id, evolution.projetos?.nome_projeto || "")}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Evolução</DialogTitle>
            </DialogHeader>
            {editingEvolution && (
              <ProjectEvolutionForm
                initialData={editingEvolution}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ProjectEvolution;
