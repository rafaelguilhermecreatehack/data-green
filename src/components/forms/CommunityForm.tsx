import { useState, useEffect } from "react";
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

interface Community {
  id: string;
  cidade: string;
  estado: string;
  bairro: string;
  total_beneficiarios: number;
  idh: number;
  created_at: string;
  updated_at: string;
}

interface CommunityFormProps {
  initialData?: Community;
  onSuccess?: () => void;
}

const CommunityForm = ({ initialData, onSuccess }: CommunityFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      cidade: "",
      estado: "",
      bairro: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        cidade: initialData.cidade,
        estado: initialData.estado,
        bairro: initialData.bairro,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: CommunityFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && initialData) {
        // Update existing community
        const { error } = await supabase
          .from("comunidades")
          .update({
            cidade: data.cidade,
            estado: data.estado,
            bairro: data.bairro,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) {
          toast({
            title: "Erro ao atualizar comunidade",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Comunidade atualizada com sucesso!",
          description: `${data.bairro}, ${data.cidade} foi atualizada`,
        });
      } else {
        // Create new community
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
          description: `${data.bairro}, ${data.cidade} foi adicionada`,
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
          {isEditing ? "Editar Comunidade" : "Nova Comunidade"}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações da comunidade" 
            : "Preencha os dados para cadastrar uma nova comunidade"
          }
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

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading 
                ? (isEditing ? "Atualizando..." : "Cadastrando...") 
                : (isEditing ? "Atualizar Comunidade" : "Cadastrar Comunidade")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CommunityForm;