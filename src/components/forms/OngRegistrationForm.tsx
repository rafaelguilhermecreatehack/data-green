import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ongRegistrationSchema = z.object({
  nomeOng: z.string().min(2, "Nome da ONG deve ter pelo menos 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos").max(18, "CNPJ inválido"),
  categoria: z.enum(["educacao", "saude", "meio_ambiente", "assistencia_social", "cultura", "esporte", "outros"]),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  endereco: z.string().min(10, "Endereço deve ser mais detalhado"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  cep: z.string().min(8, "CEP deve ter 8 dígitos"),
  descricaoAtividades: z.string().min(50, "Descrição deve ter pelo menos 50 caracteres"),
  receitaAnual: z.enum(["ate_50k", "50k_100k", "100k_500k", "500k_1m", "acima_1m"]),
  responsavelNome: z.string().min(2, "Nome do responsável é obrigatório"),
  responsavelCargo: z.string().min(2, "Cargo do responsável é obrigatório"),
  responsavelEmail: z.string().email("Email do responsável inválido"),
});

type OngRegistrationFormData = z.infer<typeof ongRegistrationSchema>;

interface OngRegistrationFormProps {
  onSuccess?: () => void;
}

const categoriaOptions = [
  { value: "educacao", label: "Educação" },
  { value: "saude", label: "Saúde" },
  { value: "meio_ambiente", label: "Meio Ambiente" },
  { value: "assistencia_social", label: "Assistência Social" },
  { value: "cultura", label: "Cultura" },
  { value: "esporte", label: "Esporte" },
  { value: "outros", label: "Outros" },
];

const receitaOptions = [
  { value: "ate_50k", label: "Até R$ 50.000" },
  { value: "50k_100k", label: "R$ 50.000 - R$ 100.000" },
  { value: "100k_500k", label: "R$ 100.000 - R$ 500.000" },
  { value: "500k_1m", label: "R$ 500.000 - R$ 1.000.000" },
  { value: "acima_1m", label: "Acima de R$ 1.000.000" },
];

const OngRegistrationForm = ({ onSuccess }: OngRegistrationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<OngRegistrationFormData>({
    resolver: zodResolver(ongRegistrationSchema),
    defaultValues: {
      nomeOng: "",
      cnpj: "",
      categoria: "educacao",
      email: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      descricaoAtividades: "",
      receitaAnual: "ate_50k",
      responsavelNome: "",
      responsavelCargo: "",
      responsavelEmail: "",
    },
  });

  const onSubmit = async (data: OngRegistrationFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-ong-registration', {
        body: {
          ...data,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) {
        toast({
          title: "Erro no envio",
          description: "Não foi possível enviar o cadastro. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Cadastro enviado com sucesso!",
        description: "Nossa equipe receberá os dados e entrará em contato em breve.",
      });

      form.reset();
      onSuccess?.();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados da ONG */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Dados da ONG</h3>
          
          <FormField
            control={form.control}
            name="nomeOng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da ONG</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome completo da organização" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="00.000.000/0000-00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {categoriaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email da ONG</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="contato@ong.org" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(11) 99999-9999" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Endereço</h3>
          
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço Completo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Rua, número, bairro" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="São Paulo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="SP" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="00000-000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Adicionais</h3>
          
          <FormField
            control={form.control}
            name="descricaoAtividades"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição das Atividades</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Descreva as principais atividades e missão da ONG..."
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receitaAnual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receita Anual Estimada</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a faixa de receita" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {receitaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Responsável */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Responsável pelo Cadastro</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="responsavelNome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do responsável" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsavelCargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo/Função</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Presidente, Diretor, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="responsavelEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email do Responsável</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="responsavel@email.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Enviando cadastro..." : "Enviar Cadastro"}
        </Button>
      </form>
    </Form>
  );
};

export default OngRegistrationForm;