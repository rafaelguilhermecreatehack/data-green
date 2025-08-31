import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const investorSchema = z.object({
  nome_investidor: z.string().optional().transform(val => val && val.trim() !== "" ? val : "Anônimo"),
  tipo_investidor: z.enum(["pessoa_fisica", "pessoa_juridica", "governo", "organismo_internacional"]),
  contato: z.string().min(1, "Contato é obrigatório").email("Digite um email válido"),
  documento: z.string().min(1, "Documento é obrigatório"),
});

type InvestorFormData = z.infer<typeof investorSchema>;

interface Investor {
  id: string;
  nome_investidor: string;
  tipo_investidor: string;
  contato: string;
  documento: string;
  created_at: string;
  updated_at: string;
}

interface InvestorFormProps {
  initialData?: Investor;
  onSuccess?: () => void;
}

const investorTypeLabels = {
  pessoa_fisica: "Pessoa Física",
  pessoa_juridica: "Pessoa Jurídica",
  governo: "Governo",
  organismo_internacional: "Organismo Internacional",
};

const InvestorForm = ({ initialData, onSuccess }: InvestorFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      nome_investidor: "",
      tipo_investidor: "pessoa_fisica",
      contato: "",
      documento: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        nome_investidor: initialData.nome_investidor,
        tipo_investidor: initialData.tipo_investidor as any,
        contato: initialData.contato || "",
        documento: initialData.documento || "",
      });
    }
  }, [initialData, form]);

  const formatDocument = (value: string, type: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'pessoa_fisica') {
      // Format CPF: 000.000.000-00
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        .replace(/(\d{3})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4')
        .replace(/(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3')
        .replace(/(\d{3})(\d{2})$/, '$1.$2');
    } else if (type === 'pessoa_juridica') {
      // Format CNPJ: 00.000.000/0000-00
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1})$/, '$1.$2.$3/$4-$5')
        .replace(/(\d{2})(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3/$4')
        .replace(/(\d{2})(\d{3})(\d{2})$/, '$1.$2.$3')
        .replace(/(\d{2})(\d{2})$/, '$1.$2');
    }
    
    return numbers;
  };

  const getDocumentPlaceholder = (type: string) => {
    switch (type) {
      case 'pessoa_fisica':
        return "000.000.000-00";
      case 'pessoa_juridica':
        return "00.000.000/0000-00";
      case 'governo':
        return "Código/Registro do órgão";
      case 'organismo_internacional':
        return "Código de identificação";
      default:
        return "Documento de identificação";
    }
  };

  const onSubmit = async (data: InvestorFormData) => {
    setIsLoading(true);
    try {
      const investorData = {
        nome_investidor: data.nome_investidor,
        tipo_investidor: data.tipo_investidor,
        contato: data.contato,
        documento: data.documento,
      };

      if (isEditing && initialData) {
        const { error } = await supabase
          .from("investidores")
          .update({
            ...investorData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) {
          toast({
            title: "Erro ao atualizar investidor",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Investidor atualizado com sucesso!",
          description: `${data.nome_investidor} foi atualizado`,
        });
      } else {
        const { error } = await supabase
          .from("investidores")
          .insert([investorData]);

        if (error) {
          toast({
            title: "Erro ao cadastrar investidor",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Investidor cadastrado com sucesso!",
          description: `${data.nome_investidor} foi adicionado`,
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

  const watchedType = form.watch("tipo_investidor");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {isEditing ? "Editar Investidor" : "Novo Investidor"}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações do investidor" 
            : "Preencha os dados para cadastrar um novo investidor"
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome_investidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Investidor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Empresa XYZ Ltda ou João Silva (deixe vazio para 'Anônimo')" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo_investidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Investidor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(investorTypeLabels).map(([value, label]) => (
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
            name="contato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de Contato</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="contato@exemplo.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {watchedType === 'pessoa_fisica' ? 'CPF' : 
                   watchedType === 'pessoa_juridica' ? 'CNPJ' : 'Documento'}
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder={getDocumentPlaceholder(watchedType)}
                    onChange={(e) => {
                      const formatted = formatDocument(e.target.value, watchedType);
                      field.onChange(formatted);
                    }}
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
                : (isEditing ? "Atualizar Investidor" : "Cadastrar Investidor")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default InvestorForm;
