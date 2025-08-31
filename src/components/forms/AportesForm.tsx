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

const aportesSchema = z.object({
  id_investidor: z.string().uuid("Selecione um investidor válido"),
  id_projeto: z.string().uuid("Selecione um projeto válido"),
  valor_aporte: z.string().min(1, "Valor do aporte é obrigatório"),
  data_aporte: z.string().min(1, "Data do aporte é obrigatória"),
  descricao: z.string().optional(),
});

type AportesFormData = z.infer<typeof aportesSchema>;

interface Aporte {
  id: string;
  id_investidor: string;
  id_projeto: string;
  valor_aporte: number;
  data_aporte: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

interface Investor {
  id: string;
  nome_investidor: string;
  tipo_investidor: string;
}

interface Project {
  id: string;
  nome_projeto: string;
  categoria: string;
  status: string;
}

interface AportesFormProps {
  initialData?: Aporte;
  onSuccess?: () => void;
}

const AportesForm = ({ initialData, onSuccess }: AportesFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<AportesFormData>({
    resolver: zodResolver(aportesSchema),
    defaultValues: {
      id_investidor: "",
      id_projeto: "",
      valor_aporte: "",
      data_aporte: new Date().toISOString().split('T')[0],
      descricao: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch investors
        const { data: investorsData, error: investorsError } = await supabase
          .from("investidores")
          .select("id, nome_investidor, tipo_investidor")
          .order("nome_investidor");

        if (investorsError) {
          console.error("Error fetching investors:", investorsError);
        } else {
          setInvestors(investorsData || []);
        }

        // Fetch projects from user's ONG
        const { data: projectsData, error: projectsError } = await supabase
          .from("projetos")
          .select("id, nome_projeto, categoria, status")
          .order("nome_projeto");

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
        } else {
          setProjects(projectsData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      form.reset({
        id_investidor: initialData.id_investidor,
        id_projeto: initialData.id_projeto,
        valor_aporte: initialData.valor_aporte.toString(),
        data_aporte: initialData.data_aporte,
        descricao: initialData.descricao || "",
      });
    }
  }, [initialData, form]);

  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters except dots and commas
    const numbers = value.replace(/[^\d.,]/g, '');
    
    // Convert to proper decimal format
    const cleanNumber = numbers.replace(/,/g, '.');
    
    // Ensure only one decimal point
    const parts = cleanNumber.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleanNumber;
  };

  const onSubmit = async (data: AportesFormData) => {
    setIsLoading(true);
    try {
      const aportesData = {
        id_investidor: data.id_investidor,
        id_projeto: data.id_projeto,
        valor_aporte: parseFloat(data.valor_aporte),
        data_aporte: data.data_aporte,
        descricao: data.descricao || null,
      };

      if (isEditing && initialData) {
        const { error } = await supabase
          .from("aportes")
          .update({
            ...aportesData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) {
          toast({
            title: "Erro ao atualizar aporte",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Aporte atualizado com sucesso!",
          description: `Aporte de R$ ${data.valor_aporte} foi atualizado`,
        });
      } else {
        const { error } = await supabase
          .from("aportes")
          .insert([aportesData]);

        if (error) {
          toast({
            title: "Erro ao cadastrar aporte",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Aporte cadastrado com sucesso!",
          description: `Aporte de R$ ${data.valor_aporte} foi registrado`,
        });
      }

      onSuccess?.();
      if (!isEditing) {
        form.reset({
          id_investidor: "",
          id_projeto: "",
          valor_aporte: "",
          data_aporte: new Date().toISOString().split('T')[0],
          descricao: "",
        });
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

  const getInvestorTypeLabel = (type: string) => {
    const labels = {
      pessoa_fisica: "Pessoa Física",
      pessoa_juridica: "Pessoa Jurídica",
      governo: "Governo",
      organismo_internacional: "Organismo Internacional",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getProjectStatusLabel = (status: string) => {
    const labels = {
      planejamento: "Planejamento",
      em_andamento: "Em Andamento",
      concluido: "Concluído",
      suspenso: "Suspenso",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {isEditing ? "Editar Aporte" : "Novo Aporte"}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações do aporte" 
            : "Preencha os dados para registrar um novo aporte"
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="id_investidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investidor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um investidor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {investors.map((investor) => (
                      <SelectItem key={investor.id} value={investor.id}>
                        <div className="flex flex-col">
                          <span>{investor.nome_investidor}</span>
                          <span className="text-xs text-muted-foreground">
                            {getInvestorTypeLabel(investor.tipo_investidor)}
                          </span>
                        </div>
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
            name="id_projeto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex flex-col">
                          <span>{project.nome_projeto}</span>
                          <span className="text-xs text-muted-foreground">
                            {getProjectStatusLabel(project.status)}
                          </span>
                        </div>
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
            name="valor_aporte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor do Aporte (R$)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_aporte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Aporte</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva o propósito ou detalhes do aporte..."
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
                ? (isEditing ? "Atualizando..." : "Cadastrando...") 
                : (isEditing ? "Atualizar Aporte" : "Cadastrar Aporte")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AportesForm;
