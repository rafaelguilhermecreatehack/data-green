import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const peopleSchema = z.object({
  nome_completo: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  genero: z.enum(["masculino", "feminino", "outro", "prefiro_nao_informar"]).optional(),
  projetos_vinculados: z.array(z.string().uuid()).min(1, "Selecione pelo menos um projeto"),
  id_comunidade: z.string().uuid("Selecione uma comunidade válida"),
  faixa_renda_familiar: z.enum(["ate_1_salario", "1_2_salarios", "2_3_salarios", "3_5_salarios", "acima_5_salarios"]).optional(),
  nivel_escolaridade: z.enum(["sem_escolaridade", "fundamental_incompleto", "fundamental_completo", "medio_incompleto", "medio_completo", "superior_incompleto", "superior_completo", "pos_graduacao"]).optional(),
  anos_estudo: z.string().optional(),
  peso: z.string().optional(),
  altura: z.string().optional(),
});

type PeopleFormData = z.infer<typeof peopleSchema>;

interface Person {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  genero?: string;
  id_comunidade: string;
  faixa_renda_familiar?: string;
  nivel_escolaridade?: string;
  anos_estudo?: number;
  indicadores_saude?: any;
  created_at: string;
  updated_at: string;
  projetos?: Array<{
    projeto_id: string;
    nome_projeto: string;
    data_vinculacao: string;
    ativo: boolean;
  }>;
}

interface Project {
  id: string;
  nome_projeto: string;
}

interface Community {
  id: string;
  cidade: string;
  estado: string;
  bairro: string;
}

interface PeopleFormProps {
  initialData?: Person;
  onSuccess?: () => void;
}

const genderLabels = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  prefiro_nao_informar: "Prefiro não informar",
};

const incomeLabels = {
  ate_1_salario: "Até 1 salário mínimo",
  "1_2_salarios": "1 a 2 salários mínimos",
  "2_3_salarios": "2 a 3 salários mínimos",
  "3_5_salarios": "3 a 5 salários mínimos",
  acima_5_salarios: "Acima de 5 salários mínimos",
};

const educationLabels = {
  sem_escolaridade: "Sem escolaridade",
  fundamental_incompleto: "Fundamental incompleto",
  fundamental_completo: "Fundamental completo",
  medio_incompleto: "Médio incompleto",
  medio_completo: "Médio completo",
  superior_incompleto: "Superior incompleto",
  superior_completo: "Superior completo",
  pos_graduacao: "Pós-graduação",
};

const PeopleForm = ({ initialData, onSuccess }: PeopleFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<PeopleFormData>({
    resolver: zodResolver(peopleSchema),
    defaultValues: {
      nome_completo: "",
      data_nascimento: "",
      genero: undefined,
      projetos_vinculados: [],
      id_comunidade: "",
      faixa_renda_familiar: undefined,
      nivel_escolaridade: undefined,
      anos_estudo: "",
      peso: "",
      altura: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projetos")
        .select("id, nome_projeto")
        .order("nome_projeto", { ascending: true });

      if (projectsError) {
        toast({
          title: "Erro ao carregar projetos",
          description: projectsError.message,
          variant: "destructive",
        });
      } else {
        setProjects(projectsData || []);
      }

      // Fetch communities
      const { data: communitiesData, error: communitiesError } = await supabase
        .from("comunidades")
        .select("id, cidade, estado, bairro")
        .order("cidade", { ascending: true });

      if (communitiesError) {
        toast({
          title: "Erro ao carregar comunidades",
          description: communitiesError.message,
          variant: "destructive",
        });
      } else {
        setCommunities(communitiesData || []);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    if (initialData) {
      const indicadores = initialData.indicadores_saude || {};
      const projetosIds = initialData.projetos?.map(p => p.projeto_id) || [];
      setSelectedProjects(projetosIds);
      form.reset({
        nome_completo: initialData.nome_completo,
        data_nascimento: initialData.data_nascimento,
        genero: initialData.genero as any,
        projetos_vinculados: projetosIds,
        id_comunidade: initialData.id_comunidade,
        faixa_renda_familiar: initialData.faixa_renda_familiar as any,
        nivel_escolaridade: initialData.nivel_escolaridade as any,
        anos_estudo: initialData.anos_estudo?.toString() || "",
        peso: indicadores.peso?.toString() || "",
        altura: indicadores.altura?.toString() || "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: PeopleFormData) => {
    setIsLoading(true);
    try {
      // Prepare health indicators
      const indicadores_saude: any = {};
      if (data.peso) indicadores_saude.peso = parseFloat(data.peso);
      if (data.altura) indicadores_saude.altura = parseFloat(data.altura);
      
      // Calculate BMI if both weight and height are provided
      if (data.peso && data.altura) {
        const peso = parseFloat(data.peso);
        const altura = parseFloat(data.altura) / 100; // Convert cm to meters
        indicadores_saude.imc = peso / (altura * altura);
      }

      const personData = {
        nome_completo: data.nome_completo,
        data_nascimento: data.data_nascimento,
        genero: data.genero || null,
        id_comunidade: data.id_comunidade,
        faixa_renda_familiar: data.faixa_renda_familiar || null,
        nivel_escolaridade: data.nivel_escolaridade || null,
        anos_estudo: data.anos_estudo ? parseInt(data.anos_estudo) : 0,
        indicadores_saude,
      };

      if (isEditing && initialData) {
        // Update person data
        const { error: personError } = await supabase
          .from("pessoas")
          .update({
            ...personData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (personError) {
          toast({
            title: "Erro ao atualizar pessoa",
            description: personError.message,
            variant: "destructive",
          });
          return;
        }

        // Update project relationships using SQL queries
        // First, deactivate all current relationships
        const { error: deactivateError } = await supabase
          .from('pessoa_projeto' as any)
          .update({ ativo: false })
          .eq('id_pessoa', initialData.id);

        if (deactivateError) {
          console.error('Error deactivating relationships:', deactivateError);
        }

        // Then, insert/reactivate selected projects
        for (const projectId of data.projetos_vinculados) {
          const { error: relationError } = await supabase
            .from('pessoa_projeto' as any)
            .upsert({
              id_pessoa: initialData.id,
              id_projeto: projectId,
              ativo: true,
              data_vinculacao: new Date().toISOString().split('T')[0],
            });

          if (relationError) {
            console.error('Error updating project relationship:', relationError);
          }
        }

        toast({
          title: "Pessoa atualizada com sucesso!",
          description: `${data.nome_completo} foi atualizada`,
        });
      } else {
        // Insert new person
        const { data: newPerson, error: personError } = await supabase
          .from("pessoas")
          .insert([personData])
          .select()
          .single();

        if (personError) {
          toast({
            title: "Erro ao cadastrar pessoa",
            description: personError.message,
            variant: "destructive",
          });
          return;
        }

        // Insert project relationships
        const relationships = data.projetos_vinculados.map(projectId => ({
          id_pessoa: newPerson.id,
          id_projeto: projectId,
          ativo: true,
          data_vinculacao: new Date().toISOString().split('T')[0],
        }));

        if (relationships.length > 0) {
          const { error: relationError } = await supabase
            .from('pessoa_projeto' as any)
            .insert(relationships);

          if (relationError) {
            console.error('Error inserting project relationships:', relationError);
          }
        }

        toast({
          title: "Pessoa cadastrada com sucesso!",
          description: `${data.nome_completo} foi adicionada`,
        });
      }

      onSuccess?.();
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {isEditing ? "Editar Pessoa" : "Nova Pessoa"}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações da pessoa" 
            : "Preencha os dados para cadastrar uma nova pessoa"
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome_completo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Maria Silva Santos" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_nascimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(genderLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="projetos_vinculados"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projetos Vinculados</FormLabel>
                  <div className="space-y-3">
                    {/* Selected projects display */}
                    {selectedProjects.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedProjects.map((projectId) => {
                          const project = projects.find(p => p.id === projectId);
                          return project ? (
                            <Badge key={projectId} variant="secondary" className="flex items-center gap-1">
                              {project.nome_projeto}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => {
                                  const newSelected = selectedProjects.filter(id => id !== projectId);
                                  setSelectedProjects(newSelected);
                                  field.onChange(newSelected);
                                }}
                              />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {/* Project selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {projects.map((project) => (
                        <div key={project.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={project.id}
                            checked={selectedProjects.includes(project.id)}
                            onCheckedChange={(checked) => {
                              let newSelected;
                              if (checked) {
                                newSelected = [...selectedProjects, project.id];
                              } else {
                                newSelected = selectedProjects.filter(id => id !== project.id);
                              }
                              setSelectedProjects(newSelected);
                              field.onChange(newSelected);
                            }}
                          />
                          <label 
                            htmlFor={project.id} 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {project.nome_projeto}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id_comunidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comunidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a comunidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {communities.map((community) => (
                        <SelectItem key={community.id} value={community.id}>
                          {community.bairro}, {community.cidade} - {community.estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="faixa_renda_familiar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa de Renda Familiar</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa de renda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(incomeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nivel_escolaridade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Escolaridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a escolaridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(educationLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="anos_estudo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anos de Estudo</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="25"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Indicadores de Saúde</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.1"
                        placeholder="70.5"
                        min="0"
                        max="300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="altura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="170"
                        min="50"
                        max="250"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading 
                ? (isEditing ? "Atualizando..." : "Cadastrando...") 
                : (isEditing ? "Atualizar Pessoa" : "Cadastrar Pessoa")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PeopleForm;
