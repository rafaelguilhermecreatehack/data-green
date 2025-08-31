import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Constants } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nome_fantasia: z.string().min(2, "Nome fantasia deve ter pelo menos 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos").max(18, "CNPJ inválido"),
  categoria: z.enum(Constants.public.Enums.ong_category as unknown as [string, ...string[]]),
  contato: z.string().email("Email inválido"),
  receita_anual: z.string().optional(),
  endereco_cep: z.string().min(8, "CEP deve ter 8 dígitos").max(9, "CEP inválido"),
  endereco_rua: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  endereco_numero: z.string().min(1, "Número é obrigatório"),
  endereco_bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  endereco_cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  endereco_estado: z.string().min(2, "Estado deve ter pelo menos 2 caracteres"),
  endereco_complemento: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const OngRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_fantasia: "",
      cnpj: "",
      categoria: undefined,
      contato: "",
      receita_anual: "",
      endereco_cep: "",
      endereco_rua: "",
      endereco_numero: "",
      endereco_bairro: "",
      endereco_cidade: "",
      endereco_estado: "",
      endereco_complemento: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Check if CNPJ already exists
      const { data: existingOng } = await supabase
        .from("ongs")
        .select("cnpj")
        .eq("cnpj", data.cnpj)
        .single();

      if (existingOng) {
        toast({
          title: "CNPJ já cadastrado",
          description: "Este CNPJ já está registrado no sistema.",
          variant: "destructive",
        });
        return;
      }

      // Prepare address data
      const endereco_sede = {
        cep: data.endereco_cep,
        rua: data.endereco_rua,
        numero: data.endereco_numero,
        bairro: data.endereco_bairro,
        cidade: data.endereco_cidade,
        estado: data.endereco_estado,
        complemento: data.endereco_complemento || null,
      };

      // Insert ONG
      const { error } = await supabase.from("ongs").insert({
        nome_fantasia: data.nome_fantasia,
        cnpj: data.cnpj,
        categoria: data.categoria as any,
        contato: data.contato,
        receita_anual: data.receita_anual ? parseFloat(data.receita_anual) : null,
        endereco_sede,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "ONG cadastrada com sucesso!",
        description: "A organização foi registrada no sistema.",
      });

      form.reset();
    } catch (error: any) {
      console.error("Error creating ONG:", error);
      toast({
        title: "Erro ao cadastrar ONG",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nome_fantasia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Fantasia</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da ONG" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} />
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
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Constants.public.Enums.ong_category.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, " ").toUpperCase()}
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
                  <Input type="email" placeholder="contato@ong.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receita_anual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receita Anual (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Endereço da Sede</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="endereco_cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco_rua"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da rua" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco_numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco_bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco_complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt, sala, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco_cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco_estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            "Cadastrar ONG"
          )}
        </Button>
      </form>
    </Form>
  );
};