import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const communitySchema = z.object({
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  estado: z.string().min(2, "Estado deve ter pelo menos 2 caracteres"),
  bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
});

type CommunityFormData = z.infer<typeof communitySchema>;

interface CommunityRegistrationFormProps {
  onSuccess?: () => void;
}

const CommunityRegistrationForm = ({ onSuccess }: CommunityRegistrationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      cidade: "",
      estado: "",
      bairro: "",
    },
  });

  const onSubmit = async (data: CommunityFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("comunidades")
        .insert([
          {
            cidade: data.cidade,
            estado: data.estado,
            bairro: data.bairro,
            total_beneficiarios: 0,
            idh: 0.000,
          },
        ]);

      if (error) {
        toast({
          title: "Erro ao cadastrar comunidade",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Comunidade cadastrada com sucesso!",
        description: "Agora você pode continuar para o dashboard",
      });

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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Primeira Configuração</h2>
        <p className="text-muted-foreground">
          Para começar, você precisa cadastrar pelo menos uma comunidade
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: São Paulo" />
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
                  <Input {...field} placeholder="Ex: SP" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Centro" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar Comunidade"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CommunityRegistrationForm;