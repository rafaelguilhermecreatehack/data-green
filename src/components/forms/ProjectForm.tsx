import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const projectSchema = z.object({
  nome_projeto: z.string().min(3, "Nome do projeto deve ter pelo menos 3 caracteres"),
  escopo: z.string().min(10, "Escopo deve ter pelo menos 10 caracteres"),
  categoria: z.enum(["educacao", "saude", "meio_ambiente", "assistencia_social", "cultura", "direitos_humanos"]),
  id_comunidade: z.string().uuid("Selecione uma comunidade válida"),
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  data_fim_prevista: z.string().min(1, "Data de fim prevista é obrigatória"),
  status: z.enum(["planejamento", "em_andamento", "concluido", "suspenso"]),
  orcamento_total: z.string().min(1, "Orçamento é obrigatório"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface Project {
  id: string;
  nome_projeto: string;
  escopo: string;
  categoria: string;
  id_comunidade: string;
  data_inicio: string;
  data_fim_prevista: string;
  status: string;
  orcamento_total: number;
  id_ong_responsavel: string;
  created_at: string;
  updated_at: string;
}

interface Community {
  id: string;
  cidade: string;
  estado: string;
  bairro: string;
}

interface ProjectFormProps {
  initialData?: Project;
  onSuccess?: () => void;
}

const categoryLabels = {
  educacao: "Educação",
  saude: "Saúde",
  meio_ambiente: "Meio Ambiente",
  assistencia_social: "Assistência Social",
  cultura: "Cultura",
  direitos_humanos: "Direitos Humanos",
};

const statusLabels = {
  planejamento: "Planejamento",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  suspenso: "Suspenso",
};

const ProjectForm = ({ initialData, onSuccess }: ProjectFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userOngId, setUserOngId] = useState<string | null>(null);
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      nome_projeto: "",
      escopo: "",
      categoria: "educacao",
      id_comunidade: "",
      data_inicio: "",
      data_fim_prevista: "",
      status: "planejamento",
      orcamento_total: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("usuarios")
        .select("id_ong_vinculada")
        .eq("user_id", user.id)
        .single();

      if (userData?.id_ong_vinculada) {
        setUserOngId(userData.id_ong_vinculada);
      }
    };

    const fetchCommunities = async () => {
      const { data, error } = await supabase
        .from("comunidades")
        .select("id, cidade, estado, bairro")
        .order("cidade", { ascending: true });

      if (error) {
        toast({
          title: "Erro ao carregar comunidades",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setCommunities(data || []);
    };

    fetchUserData();
    fetchCommunities();
  }, [toast]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome_projeto: initialData.nome_projeto,
        escopo: initialData.escopo,
        categoria: initialData.categoria as any,
        id_comunidade: initialData.id_comunidade,
        data_inicio: initialData.data_inicio,
        data_fim_prevista: initialData.data_fim_prevista,
        status: initialData.status as any,
        orcamento_total: initialData.orcamento_total.toString(),
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!userOngId) {
      toast({
        title: "Erro",
        description: "Usuário não está vinculado a uma ONG",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const projectData = {
        nome_projeto: data.nome_projeto,
        escopo: data.escopo,
        categoria: data.categoria,
        id_comunidade: data.id_comunidade,
        data_inicio: data.data_inicio,
        data_fim_prevista: data.data_fim_prevista,
        status: data.status,
        orcamento_total: parseFloat(data.orcamento_total),
        id_ong_responsavel: userOngId,
      };

      if (isEditing && initialData) {
        const { error } = await supabase
          .from("projetos")
          .update({
            ...projectData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) {
          toast({
            title: "Erro ao atualizar projeto",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Projeto atualizado com sucesso!",
          description: `${data.nome_projeto} foi atualizado`,
        });
      } else {
        const { error } = await supabase
          .from("projetos")
          .insert([projectData]);

        if (error) {
          toast({
            title: "Erro ao cadastrar projeto",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Projeto cadastrado com sucesso!",
          description: `${data.nome_projeto} foi adicionado`,
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
          {isEditing ? "Editar Projeto" : "Novo Projeto"}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações do projeto" 
            : "Preencha os dados para cadastrar um novo projeto"
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome_projeto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Curso de Alfabetização Digital" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="escopo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escopo do Projeto</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva detalhadamente o escopo e objetivos do projeto"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_inicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_fim_prevista"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Fim Prevista</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="orcamento_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orçamento Total (R$)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading 
                ? (isEditing ? "Atualizando..." : "Cadastrando...") 
                : (isEditing ? "Atualizar Projeto" : "Cadastrar Projeto")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProjectForm;
