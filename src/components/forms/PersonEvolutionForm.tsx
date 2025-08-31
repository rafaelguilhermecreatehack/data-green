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

const personEvolutionSchema = z.object({
  id_pessoa: z.string().uuid("Selecione uma pessoa válida"),
  observacoes: z.string().min(10, "Observações devem ter pelo menos 10 caracteres"),
  progresso_educacional: z.string().optional(),
  progresso_saude: z.string().optional(),
  participacao_atividades: z.string().optional(),
  mudanca_renda: z.string().optional(),
  mudanca_escolaridade: z.string().optional(),
  peso_anterior: z.string().optional(),
  peso_atual: z.string().optional(),
  altura_anterior: z.string().optional(),
  altura_atual: z.string().optional(),
});

type PersonEvolutionFormData = z.infer<typeof personEvolutionSchema>;

interface PersonEvolution {
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
}

interface Person {
  id: string;
  nome_completo: string;
  faixa_renda_familiar?: string;
  nivel_escolaridade?: string;
  indicadores_saude?: any;
}

interface PersonEvolutionFormProps {
  initialData?: PersonEvolution;
  onSuccess?: () => void;
  preSelectedPersonId?: string;
}

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

const PersonEvolutionForm = ({ initialData, onSuccess, preSelectedPersonId }: PersonEvolutionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<PersonEvolutionFormData>({
    resolver: zodResolver(personEvolutionSchema),
    defaultValues: {
      id_pessoa: preSelectedPersonId || "",
      observacoes: "",
      progresso_educacional: "",
      progresso_saude: "",
      participacao_atividades: "",
      mudanca_renda: undefined,
      mudanca_escolaridade: undefined,
      peso_anterior: "",
      peso_atual: "",
      altura_anterior: "",
      altura_atual: "",
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

      // Fetch people from user's ONG projects
      if (userData?.id_ong_vinculada) {
        const { data: peopleData, error } = await supabase
          .from("pessoas")
          .select(`
            id, 
            nome_completo, 
            faixa_renda_familiar, 
            nivel_escolaridade,
            projetos!id_projeto_vinculado(
              id_ong_responsavel
            )
          `)
          .eq("projetos.id_ong_responsavel", userData.id_ong_vinculada)
          .order("nome_completo", { ascending: true });

        if (error) {
          toast({
            title: "Erro ao carregar pessoas",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setPeople(peopleData || []);
      }
    };

    fetchUserData();
  }, [toast]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        id_pessoa: initialData.id_pessoa,
        observacoes: initialData.observacoes || "",
        progresso_educacional: initialData.conquistas_educacionais || "",
        progresso_saude: initialData.melhorias_saude || "",
        participacao_atividades: initialData.nivel_participacao || "",
        mudanca_renda: initialData.faixa_renda_atual as any,
        mudanca_escolaridade: initialData.nivel_escolaridade_atual as any,
        peso_anterior: initialData.peso_anterior?.toString() || "",
        peso_atual: initialData.peso_atual?.toString() || "",
        altura_anterior: initialData.altura_anterior?.toString() || "",
        altura_atual: initialData.altura_atual?.toString() || "",
      });
    }
  }, [initialData, form]);

  // Update selected person when person is chosen
  const handlePersonChange = (personId: string) => {
    const person = people.find(p => p.id === personId);
    setSelectedPerson(person || null);
    
    if (person && person.indicadores_saude) {
      // Pre-fill current health indicators as "previous" for comparison
      form.setValue("peso_anterior", person.indicadores_saude.peso?.toString() || "");
      form.setValue("altura_anterior", person.indicadores_saude.altura?.toString() || "");
    }
  };

  const onSubmit = async (data: PersonEvolutionFormData) => {
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
      // Prepare indicators data
      const indicadores_anteriores: any = {};
      const indicadores_atuais: any = {};

      if (data.peso_anterior) indicadores_anteriores.peso = parseFloat(data.peso_anterior);
      if (data.altura_anterior) indicadores_anteriores.altura = parseFloat(data.altura_anterior);
      if (data.peso_atual) indicadores_atuais.peso = parseFloat(data.peso_atual);
      if (data.altura_atual) indicadores_atuais.altura = parseFloat(data.altura_atual);

      // Calculate BMI if both weight and height are provided
      if (data.peso_atual && data.altura_atual) {
        const peso = parseFloat(data.peso_atual);
        const altura = parseFloat(data.altura_atual) / 100; // Convert cm to meters
        indicadores_atuais.imc = peso / (altura * altura);
      }

      const evolutionData = {
        id_pessoa: data.id_pessoa,
        observacoes: data.observacoes,
        conquistas_educacionais: data.progresso_educacional || null,
        melhorias_saude: data.progresso_saude || null,
        nivel_participacao: data.participacao_atividades || null,
        mudancas_socioeconomicas: data.mudanca_renda || null,
        peso_anterior: data.peso_anterior ? parseFloat(data.peso_anterior) : null,
        peso_atual: data.peso_atual ? parseFloat(data.peso_atual) : null,
        altura_anterior: data.altura_anterior ? parseFloat(data.altura_anterior) : null,
        altura_atual: data.altura_atual ? parseFloat(data.altura_atual) : null,
        imc_anterior: indicadores_anteriores.imc || null,
        imc_atual: indicadores_atuais.imc || null,
        registrado_por: userId,
      };

      if (isEditing && initialData) {
        const { error } = await supabase
          .from("evolucao_pessoa")
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
          .from("evolucao_pessoa")
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
        setSelectedPerson(null);
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
          {isEditing ? "Editar Evolução da Pessoa" : "Nova Evolução da Pessoa"}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações da evolução da pessoa" 
            : "Registre o progresso e evolução da pessoa"
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="id_pessoa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pessoa</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handlePersonChange(value);
                  }} 
                  defaultValue={field.value}
                  disabled={!!preSelectedPersonId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a pessoa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current person info display */}
          {selectedPerson && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Informações Atuais</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Renda:</span> {selectedPerson.faixa_renda_familiar ? incomeLabels[selectedPerson.faixa_renda_familiar as keyof typeof incomeLabels] : "Não informado"}
                </div>
                <div>
                  <span className="text-muted-foreground">Escolaridade:</span> {selectedPerson.nivel_escolaridade ? educationLabels[selectedPerson.nivel_escolaridade as keyof typeof educationLabels] : "Não informado"}
                </div>
                {selectedPerson.indicadores_saude?.peso && (
                  <div>
                    <span className="text-muted-foreground">Peso:</span> {selectedPerson.indicadores_saude.peso} kg
                  </div>
                )}
                {selectedPerson.indicadores_saude?.altura && (
                  <div>
                    <span className="text-muted-foreground">Altura:</span> {selectedPerson.indicadores_saude.altura} cm
                  </div>
                )}
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações *</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva o progresso geral, mudanças observadas, conquistas..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="progresso_educacional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progresso Educacional</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Avanços na educação, cursos concluídos..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progresso_saude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progresso de Saúde</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Melhorias na saúde, tratamentos..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participacao_atividades"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participação em Atividades</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Engajamento em atividades do projeto..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Mudanças Socioeconômicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mudanca_renda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Faixa de Renda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione se houve mudança" />
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
                name="mudanca_escolaridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Escolaridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione se houve mudança" />
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Indicadores de Saúde</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="peso_anterior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Anterior (kg)</FormLabel>
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
                name="peso_atual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Atual (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.1"
                        placeholder="72.0"
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
                name="altura_anterior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura Anterior (cm)</FormLabel>
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

              <FormField
                control={form.control}
                name="altura_atual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura Atual (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="172"
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

export default PersonEvolutionForm;
