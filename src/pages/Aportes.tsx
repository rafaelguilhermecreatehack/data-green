import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
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
import AportesForm from "@/components/forms/AportesForm";
import { Plus, Search, Edit, Trash2, DollarSign, Calendar, User, FolderOpen, Building } from "lucide-react";

interface Aporte {
  id: string;
  id_investidor: string;
  id_projeto: string;
  valor_aporte: number;
  data_aporte: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
  investidores: {
    nome_investidor: string;
    tipo_investidor: string;
  };
  projetos: {
    nome_projeto: string;
    categoria: string;
    status: string;
  };
}

const investorTypeLabels = {
  pessoa_fisica: "Pessoa Física",
  pessoa_juridica: "Pessoa Jurídica",
  governo: "Governo",
  organismo_internacional: "Organismo Internacional",
};

const projectStatusLabels = {
  planejamento: "Planejamento",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  suspenso: "Suspenso",
};

const projectStatusColors = {
  planejamento: "bg-yellow-100 text-yellow-800 border-yellow-200",
  em_andamento: "bg-green-100 text-green-800 border-green-200",
  concluido: "bg-blue-100 text-blue-800 border-blue-200",
  suspenso: "bg-red-100 text-red-800 border-red-200",
};

const investorTypeColors = {
  pessoa_fisica: "bg-blue-100 text-blue-800 border-blue-200",
  pessoa_juridica: "bg-green-100 text-green-800 border-green-200",
  governo: "bg-purple-100 text-purple-800 border-purple-200",
  organismo_internacional: "bg-orange-100 text-orange-800 border-orange-200",
};

const Aportes = () => {
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [filteredAportes, setFilteredAportes] = useState<Aporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAporte, setEditingAporte] = useState<Aporte | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchAportes = async () => {
    try {
      const { data, error } = await supabase
        .from("aportes")
        .select(`
          *,
          investidores (
            nome_investidor,
            tipo_investidor
          ),
          projetos (
            nome_projeto,
            categoria,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar aportes",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAportes(data || []);
      setFilteredAportes(data || []);
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
    fetchAportes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAportes(aportes);
    } else {
      const filtered = aportes.filter(
        (aporte) =>
          aporte.investidores.nome_investidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aporte.projetos.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aporte.valor_aporte.toString().includes(searchTerm) ||
          (aporte.descricao && aporte.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAportes(filtered);
    }
  }, [searchTerm, aportes]);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchAportes();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingAporte(null);
    fetchAportes();
  };

  const handleEdit = (aporte: Aporte) => {
    setEditingAporte(aporte);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (aporteId: string, valorAporte: number) => {
    try {
      const { error } = await supabase
        .from("aportes")
        .delete()
        .eq("id", aporteId);

      if (error) {
        toast({
          title: "Erro ao excluir aporte",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Aporte excluído com sucesso!",
        description: `Aporte de R$ ${valorAporte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi removido`,
      });

      fetchAportes();
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getTotalAportes = () => {
    return filteredAportes.reduce((total, aporte) => total + aporte.valor_aporte, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Aportes", current: true }]} />

        {/* Header */}
        <PageHeader 
          title="Gestão de Aportes"
          description="Gerencie os aportes e contribuições dos investidores para os projetos"
        >
          {filteredAportes.length > 0 && (
            <Badge variant="outline" className="text-sm mr-3">
              Total: {formatCurrency(getTotalAportes())}
            </Badge>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Aporte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Aporte</DialogTitle>
              </DialogHeader>
              <AportesForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar aportes por investidor, projeto, valor ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Aportes Grid */}
        {filteredAportes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? "Nenhum aporte encontrado" : "Nenhum aporte cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar os termos da sua busca"
                : "Comece registrando seu primeiro aporte"}
            </p>
            {!searchTerm && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Aporte
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Aporte</DialogTitle>
                  </DialogHeader>
                  <AportesForm onSuccess={handleCreateSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAportes.map((aporte) => (
              <Card key={aporte.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                      {formatCurrency(aporte.valor_aporte)}
                    </CardTitle>
                    <Badge
                      className={`${
                        projectStatusColors[aporte.projetos.status as keyof typeof projectStatusColors]
                      } text-xs whitespace-nowrap`}
                    >
                      {projectStatusLabels[aporte.projetos.status as keyof typeof projectStatusLabels]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{aporte.investidores.nome_investidor}</span>
                      <Badge
                        className={`${
                          investorTypeColors[aporte.investidores.tipo_investidor as keyof typeof investorTypeColors]
                        } text-xs w-fit`}
                      >
                        {investorTypeLabels[aporte.investidores.tipo_investidor as keyof typeof investorTypeLabels]}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate font-medium">{aporte.projetos.nome_projeto}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(aporte.data_aporte)}</span>
                  </div>

                  {aporte.descricao && (
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-2">{aporte.descricao}</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Registrado em {formatDate(aporte.created_at)}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(aporte)}
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
                          <AlertDialogTitle>Excluir Aporte</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este aporte de {formatCurrency(aporte.valor_aporte)}?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(aporte.id, aporte.valor_aporte)}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Aporte</DialogTitle>
            </DialogHeader>
            {editingAporte && (
              <AportesForm
                initialData={editingAporte}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Aportes;
