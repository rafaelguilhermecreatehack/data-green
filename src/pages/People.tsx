import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PeopleForm from "@/components/forms/PeopleForm";
import { Plus, Search, Edit, Trash2, Calendar, MapPin, User, GraduationCap, DollarSign, Activity } from "lucide-react";

interface Person {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  genero?: string;
  id_projeto_vinculado: string;
  id_comunidade: string;
  faixa_renda_familiar?: string;
  nivel_escolaridade?: string;
  anos_estudo?: number;
  indicadores_saude?: any;
  created_at: string;
  updated_at: string;
  projetos?: {
    nome_projeto: string;
  };
  comunidades?: {
    cidade: string;
    estado: string;
    bairro: string;
  };
}

const genderLabels = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  prefiro_nao_informar: "Prefiro não informar",
};

const incomeLabels = {
  ate_1_salario: "Até 1 SM",
  "1_2_salarios": "1-2 SM",
  "2_3_salarios": "2-3 SM",
  "3_5_salarios": "3-5 SM",
  acima_5_salarios: "Acima 5 SM",
};

const educationLabels = {
  sem_escolaridade: "Sem escolaridade",
  fundamental_incompleto: "Fund. incompleto",
  fundamental_completo: "Fund. completo",
  medio_incompleto: "Médio incompleto",
  medio_completo: "Médio completo",
  superior_incompleto: "Sup. incompleto",
  superior_completo: "Sup. completo",
  pos_graduacao: "Pós-graduação",
};

const People = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPeople = async () => {
    try {
      const { data, error } = await supabase
        .from("pessoas")
        .select(`
          *,
          projetos (
            nome_projeto
          ),
          comunidades (
            cidade,
            estado,
            bairro
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar pessoas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setPeople(data || []);
      setFilteredPeople(data || []);
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
    fetchPeople();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPeople(people);
    } else {
      const filtered = people.filter(
        (person) =>
          person.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.projetos?.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (person.comunidades && 
            `${person.comunidades.bairro} ${person.comunidades.cidade} ${person.comunidades.estado}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
      );
      setFilteredPeople(filtered);
    }
  }, [searchTerm, people]);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchPeople();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingPerson(null);
    fetchPeople();
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (personId: string, personName: string) => {
    try {
      const { error } = await supabase
        .from("pessoas")
        .delete()
        .eq("id", personId);

      if (error) {
        toast({
          title: "Erro ao excluir pessoa",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Pessoa excluída com sucesso!",
        description: `${personName} foi removida`,
      });

      fetchPeople();
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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Abaixo do peso", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25) return { status: "Peso normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30) return { status: "Sobrepeso", color: "bg-yellow-100 text-yellow-800" };
    return { status: "Obesidade", color: "bg-red-100 text-red-800" };
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestão de Pessoas
            </h1>
            <p className="text-muted-foreground">
              Gerencie os beneficiários dos projetos da sua organização
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova Pessoa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Pessoa</DialogTitle>
              </DialogHeader>
              <PeopleForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar pessoas por nome, projeto ou comunidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* People Grid */}
        {filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? "Nenhuma pessoa encontrada" : "Nenhuma pessoa cadastrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar os termos da sua busca"
                : "Comece cadastrando a primeira pessoa"}
            </p>
            {!searchTerm && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeira Pessoa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Nova Pessoa</DialogTitle>
                  </DialogHeader>
                  <PeopleForm onSuccess={handleCreateSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map((person) => {
              const age = calculateAge(person.data_nascimento);
              const bmi = person.indicadores_saude?.imc;
              const bmiStatus = bmi ? getBMIStatus(bmi) : null;

              return (
                <Card key={person.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {person.nome_completo}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {age} anos
                      </Badge>
                    </div>
                    {person.genero && (
                      <CardDescription>
                        {genderLabels[person.genero as keyof typeof genderLabels]}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {person.projetos && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        <span className="line-clamp-1">{person.projetos.nome_projeto}</span>
                      </div>
                    )}

                    {person.comunidades && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {person.comunidades.bairro}, {person.comunidades.cidade} - {person.comunidades.estado}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(person.data_nascimento)}
                      </span>
                    </div>

                    {person.nivel_escolaridade && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {educationLabels[person.nivel_escolaridade as keyof typeof educationLabels]}
                        </span>
                      </div>
                    )}

                    {person.faixa_renda_familiar && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {incomeLabels[person.faixa_renda_familiar as keyof typeof incomeLabels]}
                        </span>
                      </div>
                    )}

                    {bmiStatus && (
                      <div className="flex items-center gap-2">
                        <Badge className={`${bmiStatus.color} text-xs`}>
                          IMC: {bmi.toFixed(1)} - {bmiStatus.status}
                        </Badge>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(person)}
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
                            <AlertDialogTitle>Excluir Pessoa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{person.nome_completo}"?
                              Esta ação não pode ser desfeita e afetará o cálculo do IDH da comunidade.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(person.id, person.nome_completo)}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Pessoa</DialogTitle>
            </DialogHeader>
            {editingPerson && (
              <PeopleForm
                initialData={editingPerson}
                onSuccess={handleEditSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default People;
