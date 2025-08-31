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
import InvestorForm from "@/components/forms/InvestorForm";
import { Plus, Search, Edit, Trash2, Mail, FileText, Building, User, Globe } from "lucide-react";

interface Investor {
  id: string;
  nome_investidor: string;
  tipo_investidor: string;
  contato: string;
  documento: string;
  created_at: string;
  updated_at: string;
}

const investorTypeLabels = {
  pessoa_fisica: "Pessoa Física",
  pessoa_juridica: "Pessoa Jurídica",
  governo: "Governo",
  organismo_internacional: "Organismo Internacional",
};

const investorTypeColors = {
  pessoa_fisica: "bg-blue-100 text-blue-800 border-blue-200",
  pessoa_juridica: "bg-green-100 text-green-800 border-green-200",
  governo: "bg-purple-100 text-purple-800 border-purple-200",
  organismo_internacional: "bg-orange-100 text-orange-800 border-orange-200",
};

const investorTypeIcons = {
  pessoa_fisica: User,
  pessoa_juridica: Building,
  governo: Globe,
  organismo_internacional: Globe,
};

const Investors = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchInvestors = async () => {
    try {
      const { data, error } = await supabase
        .from("investidores")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar investidores",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setInvestors(data || []);
      setFilteredInvestors(data || []);
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
    fetchInvestors();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInvestors(investors);
    } else {
      const filtered = investors.filter(
        (investor) =>
          investor.nome_investidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          investor.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
          investor.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
          investorTypeLabels[investor.tipo_investidor as keyof typeof investorTypeLabels]
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredInvestors(filtered);
    }
  }, [searchTerm, investors]);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchInvestors();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingInvestor(null);
    fetchInvestors();
  };

  const handleEdit = (investor: Investor) => {
    setEditingInvestor(investor);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (investorId: string, investorName: string) => {
    try {
      // Check if investor has any contributions first
      const { data: contributions, error: contributionsError } = await supabase
        .from("aportes")
        .select("id")
        .eq("id_investidor", investorId)
        .limit(1);

      if (contributionsError) {
        toast({
          title: "Erro ao verificar aportes",
          description: contributionsError.message,
          variant: "destructive",
        });
        return;
      }

      if (contributions && contributions.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Este investidor possui aportes vinculados. Remova os aportes primeiro.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("investidores")
        .delete()
        .eq("id", investorId);

      if (error) {
        toast({
          title: "Erro ao excluir investidor",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Investidor excluído com sucesso!",
        description: `${investorName} foi removido`,
      });

      fetchInvestors();
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

  const maskDocument = (document: string, type: string) => {
    if (!document) return "";
    
    // Remove all non-numeric characters for processing
    const numbers = document.replace(/\D/g, '');
    
    if (type === 'pessoa_fisica' && numbers.length === 11) {
      // CPF: Show first 3 and last 2 digits
      return `${numbers.slice(0, 3)}.***.**${numbers.slice(-2)}`;
    } else if (type === 'pessoa_juridica' && numbers.length === 14) {
      // CNPJ: Show first 2 and last 2 digits
      return `${numbers.slice(0, 2)}.***.***/****-${numbers.slice(-2)}`;
    }
    
    // For other types or malformed documents, show first and last 2 characters
    if (document.length > 4) {
      return `${document.slice(0, 2)}***${document.slice(-2)}`;
    }
    
    return document;
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
        <Breadcrumb items={[{ label: "Investidores", current: true }]} />

        {/* Header */}
        <PageHeader 
          title="Gestão de Investidores"
          description="Gerencie os investidores e parceiros da sua organização"
        >
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Investidor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Investidor</DialogTitle>
              </DialogHeader>
              <InvestorForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar investidores por nome, tipo, contato ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Investors Grid */}
        {filteredInvestors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? "Nenhum investidor encontrado" : "Nenhum investidor cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar os termos da sua busca"
                : "Comece cadastrando seu primeiro investidor"}
            </p>
            {!searchTerm && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Investidor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Investidor</DialogTitle>
                  </DialogHeader>
                  <InvestorForm onSuccess={handleCreateSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestors.map((investor) => {
              const IconComponent = investorTypeIcons[investor.tipo_investidor as keyof typeof investorTypeIcons];
              
              return (
                <Card key={investor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        {investor.nome_investidor}
                      </CardTitle>
                      <Badge
                        className={`${
                          investorTypeColors[investor.tipo_investidor as keyof typeof investorTypeColors]
                        } text-xs whitespace-nowrap`}
                      >
                        {investorTypeLabels[investor.tipo_investidor as keyof typeof investorTypeLabels]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{investor.contato}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span className="font-mono">
                        {maskDocument(investor.documento, investor.tipo_investidor)}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Cadastrado em {formatDate(investor.created_at)}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(investor)}
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
                            <AlertDialogTitle>Excluir Investidor</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o investidor "{investor.nome_investidor}"?
                              Esta ação não pode ser desfeita e pode afetar os aportes vinculados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(investor.id, investor.nome_investidor)}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Investidor</DialogTitle>
            </DialogHeader>
            {editingInvestor && (
              <InvestorForm
                initialData={editingInvestor}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investors;
