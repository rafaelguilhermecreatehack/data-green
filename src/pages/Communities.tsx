import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Pencil, Trash2, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CommunityForm from "@/components/forms/CommunityForm";

interface Community {
  id: string;
  cidade: string;
  estado: string;
  bairro: string;
  total_beneficiarios: number;
  idh: number;
  created_at: string;
  updated_at: string;
}

const Communities = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate("/");
          return;
        }

        setUser(session.user);
        await loadCommunities();
      } catch (error) {
        console.error("Page initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializePage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from("comunidades")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar comunidades",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setCommunities(data || []);
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCommunity) return;

    try {
      const { error } = await supabase
        .from("comunidades")
        .delete()
        .eq("id", selectedCommunity.id);

      if (error) {
        toast({
          title: "Erro ao excluir comunidade",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Comunidade excluída com sucesso!",
        description: `${selectedCommunity.bairro}, ${selectedCommunity.cidade} foi removida`,
      });

      await loadCommunities();
      setIsDeleteOpen(false);
      setSelectedCommunity(null);
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = async () => {
    await loadCommunities();
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSelectedCommunity(null);
  };

  const formatIDH = (idh: number) => {
    if (idh === 0) return "Não calculado";
    return idh.toFixed(3);
  };

  const getIDHBadgeVariant = (idh: number) => {
    if (idh === 0) return "secondary";
    if (idh < 0.550) return "destructive";
    if (idh < 0.700) return "secondary";
    if (idh < 0.800) return "default";
    return "default";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando comunidades...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Comunidades", current: true }]} />

          {/* Header Section */}
          <PageHeader 
            title="Gestão de Comunidades"
            description="Gerencie as comunidades cadastradas na plataforma"
          >
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Comunidade
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Comunidade</DialogTitle>
                </DialogHeader>
                <CommunityForm onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          </PageHeader>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Comunidades</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communities.length}</div>
                <p className="text-xs text-muted-foreground">
                  Comunidades cadastradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pessoas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {communities.reduce((acc, curr) => acc + curr.total_beneficiarios, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pessoas atendidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IDH Médio</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {communities.length > 0 
                    ? (communities.reduce((acc, curr) => acc + curr.idh, 0) / communities.length).toFixed(3)
                    : "0.000"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Índice de desenvolvimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(communities.map(c => c.estado)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estados diferentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Communities Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Comunidades</CardTitle>
              <CardDescription>
                Todas as comunidades cadastradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {communities.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma comunidade cadastrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece cadastrando a primeira comunidade
                  </p>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Cadastrar Primeira Comunidade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Nova Comunidade</DialogTitle>
                      </DialogHeader>
                      <CommunityForm onSuccess={handleFormSuccess} />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Localização</TableHead>
                        <TableHead>Pessoas</TableHead>
                        <TableHead>IDH</TableHead>
                        <TableHead>Cadastrado em</TableHead>
                        <TableHead className="w-[70px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {communities.map((community) => (
                        <TableRow key={community.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {community.bairro}, {community.cidade}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {community.estado}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {community.total_beneficiarios}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getIDHBadgeVariant(community.idh)}>
                              {formatIDH(community.idh)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(community.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCommunity(community);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCommunity(community);
                                    setIsDeleteOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Comunidade</DialogTitle>
          </DialogHeader>
          {selectedCommunity && (
            <CommunityForm 
              initialData={selectedCommunity}
              onSuccess={handleFormSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a comunidade "{selectedCommunity?.bairro}, {selectedCommunity?.cidade}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Communities;