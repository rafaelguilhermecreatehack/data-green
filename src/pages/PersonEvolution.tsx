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
import PersonEvolutionForm from "@/components/forms/PersonEvolutionForm";
import { Plus, Search, Edit, Trash2, Calendar, User, TrendingUp, GraduationCap, Heart, Activity, DollarSign } from "lucide-react";

interface PersonEvolutionData {
  id: string;
  id_pessoa: string;
  data_registro: string;
  observacoes?: string;
  peso_anterior?: number;
  peso_atual?: number;
  altura_anterior?: number;
  altura_atual?: number;
  imc_anterior?: number;
  imc_atual?: number;
  nivel_escolaridade_anterior?: string;
  nivel_escolaridade_atual?: string;
  anos_estudo_anterior?: number;
  anos_estudo_atual?: number;
  faixa_renda_anterior?: string;
  faixa_renda_atual?: string;
  nivel_participacao?: string;
  conquistas_educacionais?: string;
  melhorias_saude?: string;
  mudancas_socioeconomicas?: string;
  registrado_por: string;
  created_at: string;
  updated_at: string;
  pessoas?: {
    nome_completo: string;
    faixa_renda_familiar?: string;
    nivel_escolaridade?: string;
  };
  usuarios?: {
    nome: string;
  };
}

const incomeLabels = {
  ate_1_salario: "Até 1 salário",
  "1_2_salarios": "1-2 salários",
  "2_3_salarios": "2-3 salários",
  "3_5_salarios": "3-5 salários",
  acima_5_salarios: "Acima de 5 salários",
};

const educationLabels = {
  sem_escolaridade: "Sem escolaridade",
  fundamental_incompleto: "Fund. incompleto",
  fundamental_completo: "Fund. completo",
  medio_incompleto: "Médio incompleto",
  medio_completo: "Médio completo",
  superior_incompleto: "Superior incompleto",
  superior_completo: "Superior completo",
  pos_graduacao: "Pós-graduação",
};

const PersonEvolution = () => {
  const [evolutions, setEvolutions] = useState<PersonEvolutionData[]>([]);
  const [filteredEvolutions, setFilteredEvolutions] = useState<PersonEvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvolution, setEditingEvolution] = useState<PersonEvolutionData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchEvolutions = async () => {
    try {
      const { data, error } = await supabase
        .from("evolucao_pessoa")
        .select(`
          id,
          id_pessoa,
          data_registro,
          observacoes,
          peso_anterior,
          peso_atual,
          altura_anterior,
          altura_atual,
          imc_anterior,
          imc_atual,
          nivel_escolaridade_anterior,
          nivel_escolaridade_atual,
          anos_estudo_anterior,
          anos_estudo_atual,
          faixa_renda_anterior,
          faixa_renda_atual,
          nivel_participacao,
          conquistas_educacionais,
          melhorias_saude,
          mudancas_socioeconomicas,
          registrado_por,
          created_at,
          updated_at,
          pessoas (
            nome_completo,
            faixa_renda_familiar,
            nivel_escolaridade
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
          evolution.pessoas?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evolution.conquistas_educacionais?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evolution.melhorias_saude?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evolution.mudancas_socioeconomicas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleEdit = (evolution: PersonEvolutionData) => {
    setEditingEvolution(evolution);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (evolutionId: string, personName: string) => {
    try {
      const { error } = await supabase
        .from("evolucao_pessoa")
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
        description: `Registro de evolução de ${personName} foi removido`,
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

  const calculateBMIChange = (evolution: PersonEvolutionData) => {
    if (evolution.peso_anterior && evolution.altura_anterior && evolution.peso_atual && evolution.altura_atual) {
      const alturaAnteriorM = evolution.altura_anterior / 100;
      const alturaAtualM = evolution.altura_atual / 100;
      const imcAnterior = evolution.peso_anterior / (alturaAnteriorM * alturaAnteriorM);
      const imcAtual = evolution.peso_atual / (alturaAtualM * alturaAtualM);
      return { anterior: imcAnterior, atual: imcAtual };
    }
    return null;
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
        <Breadcrumb items={[{ label: "Evolução de Pessoas", current: true }]} />

        {/* Header */}
        <PageHeader 
          title="Evolução de Pessoas"
          description="Acompanhe o progresso e evolução dos beneficiários"
        >
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Evolução
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Evolução</DialogTitle>
              </DialogHeader>
              <PersonEvolutionForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por pessoa, observações, progresso ou usuário..."
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
                : "Comece registrando a primeira evolução de pessoa"}
            </p>
            {!searchTerm && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primeira Evolução
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Evolução</DialogTitle>
                  </DialogHeader>
                  <PersonEvolutionForm onSuccess={handleCreateSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvolutions.map((evolution) => {
              const bmiChange = calculateBMIChange(evolution);
              
              return (
                <Card key={evolution.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-1">
                        {evolution.pessoas?.nome_completo}
                      </CardTitle>
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

                    {/* Progress Areas */}
                    <div className="grid grid-cols-1 gap-3">
                      {evolution.conquistas_educacionais && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="h-4 w-4" />
                          <span className="truncate">{evolution.conquistas_educacionais}</span>
                        </div>
                      )}
                      {evolution.melhorias_saude && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span className="truncate">{evolution.melhorias_saude}</span>
                        </div>
                      )}
                      {evolution.nivel_participacao && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Activity className="h-4 w-4" />
                          <span className="truncate">{evolution.nivel_participacao}</span>
                        </div>
                      )}
                    </div>

                    {/* Changes */}
                    <div className="space-y-2">
                      {evolution.faixa_renda_atual && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">{incomeLabels[evolution.faixa_renda_atual as keyof typeof incomeLabels] || evolution.faixa_renda_atual}</span>
                        </div>
                      )}
                      {evolution.nivel_escolaridade_atual && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600">{educationLabels[evolution.nivel_escolaridade_atual as keyof typeof educationLabels] || evolution.nivel_escolaridade_atual}</span>
                        </div>
                      )}
                      {bmiChange && (
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="w-4 h-4 text-purple-500" />
                          <Badge variant="outline" className="text-xs">
                            {bmiChange.anterior.toFixed(1)} → {bmiChange.atual.toFixed(1)}
                          </Badge>
                        </div>
                      )}

                      {(evolution.peso_anterior && evolution.peso_atual) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="w-4 h-4 text-orange-500" />
                          <Badge variant="outline" className="text-xs">
                            {evolution.peso_anterior}kg → {evolution.peso_atual}kg
                          </Badge>
                        </div>
                      )}
                    </div>

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
                              Tem certeza que deseja excluir este registro de evolução de "{evolution.pessoas?.nome_completo}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(evolution.id, evolution.pessoas?.nome_completo || "")}
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
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Evolução</DialogTitle>
            </DialogHeader>
            {editingEvolution && (
              <PersonEvolutionForm
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

export default PersonEvolution;
