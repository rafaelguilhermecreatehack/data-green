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

const projectEvolutionSchema = z.object({
  id_projeto: z.string().uuid("Selecione um projeto válido"),
  observacoes: z.string().min(10, "Observações devem ter pelo menos 10 caracteres"),
  status_anterior: z.enum(["planejamento", "em_andamento", "concluido", "suspenso"]).optional(),
  status_atual: z.enum(["planejamento", "em_andamento", "concluido", "suspenso"]).optional(),
  marco_alcancado: z.string().optional(),
  desafios_enfrentados: z.string().optional(),
  proximos_passos: z.string().optional(),
});

type ProjectEvolutionFormData = z.infer<typeof projectEvolutionSchema>;

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
}

interface Project {
  id: string;
  nome_projeto: string;
  status: string;
}

interface ProjectEvolutionFormProps {
  initialData?: ProjectEvolution;
  onSuccess?: () => void;
  preSelectedProjectId?: string;
}

const statusLabels = {
  planejamento: "Planejamento",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  suspenso: "Suspenso",
};

const ProjectEvolutionForm = ({ initialData, onSuccess, preSelectedProjectId }: ProjectEvolutionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<ProjectEvolutionFormData>({
    resolver: zodResolver(projectEvolutionSchema),
    defaultValues: {
      id_projeto: preSelectedProjectId || "",
      observacoes: "",
      status_anterior: undefined,
      status_atual: undefined,
      marco_alcancado: "",
      desafios_enfrentados: "",
      proximos_passos: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("usuarios")
        .select("id, id_ong_vinculada")
        .eq("user_id", user.id)
        .single();

      if (userData?.id) {
        setUserId(userData.id);
      }

      // Fetch projects from user's ONG
      if (userData?.id_ong_vinculada) {
        const { data: projectsData, error } = await supabase
          .from("projetos")
          .select("id, nome_projeto, status")
          .eq("id_ong_responsavel", userData.id_ong_vinculada)
          .order("nome_projeto", { ascending: true });

        if (error) {
          toast({
            title: "Erro ao carregar projetos",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setProjects(projectsData || []);
      }
    };

    fetchUserData();
  }, [toast]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        id_projeto: initialData.id_projeto,
        observacoes: initialData.observacoes,
        status_anterior: initialData.status_anterior as any,
        status_atual: initialData.status_atual as any,
        marco_alcancado: initialData.marcos_alcancados || "",
        desafios_enfrentados: initialData.desafios_enfrentados || "",
        proximos_passos: initialData.proximos_passos || "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: ProjectEvolutionFormData) => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Usuário não identificado",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const evolutionData = {
        id_projeto: data.id_projeto,
        observacoes: data.observacoes,
        status_anterior: data.status_anterior || null,
        status_atual: data.status_atual || null,
        marcos_alcancados: data.marco_alcancado || null,
        desafios_enfrentados: data.desafios_enfrentados || null,
        proximos_passos: data.proximos_passos || null,
        registrado_por: userId,
      };

      if (isEditing && initialData) {
        const { error } = await supabase
          .from("evolucao_projeto")
          .update({
            ...evolutionData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) {
          toast({
            title: "Erro ao atualizar evolução",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Evolução atualizada com sucesso!",
          description: "O registro de evolução foi atualizado",
        });
      } else {
        const { error } = await supabase
          .from("evolucao_projeto")
          .insert([evolutionData]);

        if (error) {
          toast({
            title: "Erro ao registrar evolução",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Evolução registrada com sucesso!",
          description: "O registro de evolução foi adicionado",
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
          {isEditing ? "Editar Evolução do Projeto" : "Nova Evolução do Projeto"}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações da evolução do projeto" 
            : "Registre o progresso e evolução do projeto"
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="id_projeto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!!preSelectedProjectId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.nome_projeto} ({statusLabels[project.status as keyof typeof statusLabels]})
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
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações *</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva o progresso, atividades realizadas, resultados obtidos..."
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
              name="status_anterior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Anterior</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status anterior (opcional)" />
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

            <FormField
              control={form.control}
              name="status_atual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Atual</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status atual (opcional)" />
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
            name="marco_alcancado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marco Alcançado</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva marcos importantes ou objetivos alcançados..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="desafios_enfrentados"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desafios Enfrentados</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva dificuldades, obstáculos ou desafios encontrados..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="proximos_passos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Próximos Passos</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva os próximos passos planejados para o projeto..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading 
                ? (isEditing ? "Atualizando..." : "Registrando...") 
                : (isEditing ? "Atualizar Evolução" : "Registrar Evolução")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProjectEvolutionForm;
