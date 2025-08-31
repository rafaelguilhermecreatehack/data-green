import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
  id_ong_vinculada: z.string().min(1, "Selecione uma ONG"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
});

type FormData = z.infer<typeof formSchema>;

interface Ong {
  id: string;
  nome_fantasia: string;
}

export const UserRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [loadingOngs, setLoadingOngs] = useState(true);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      id_ong_vinculada: "",
    },
  });

  useEffect(() => {
    const fetchOngs = async () => {
      try {
        const { data, error } = await supabase
          .from("ongs")
          .select("id, nome_fantasia")
          .eq("ativa", true)
          .order("nome_fantasia");

        if (error) throw error;

        setOngs(data || []);
      } catch (error) {
        console.error("Error fetching ONGs:", error);
        toast({
          title: "Erro ao carregar ONGs",
          description: "Não foi possível carregar a lista de ONGs.",
          variant: "destructive",
        });
      } finally {
        setLoadingOngs(false);
      }
    };

    fetchOngs();
  }, [toast]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Check if email already exists in users table
      const { data: existingUser } = await supabase
        .from("usuarios")
        .select("email")
        .eq("email", data.email)
        .single();

      if (existingUser) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está registrado no sistema.",
          variant: "destructive",
        });
        return;
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Falha ao criar usuário na autenticação");
      }

      // Insert user in usuarios table
      const { error: userError } = await supabase.from("usuarios").insert({
        user_id: authData.user.id,
        nome: data.nome,
        email: data.email,
        papel: "master_ong",
        id_ong_vinculada: data.id_ong_vinculada,
      });

      if (userError) {
        // If inserting in usuarios fails, we should ideally delete the auth user
        // For now, we'll just show an error
        throw new Error("Falha ao criar perfil do usuário: " + userError.message);
      }

      toast({
        title: "Usuário criado com sucesso!",
        description: "O usuário master foi registrado e receberá um email de confirmação.",
      });

      form.reset();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
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
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="joao@ong.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmarSenha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Repita a senha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_ong_vinculada"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>ONG Vinculada</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingOngs ? "Carregando ONGs..." : "Selecione uma ONG"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ongs.map((ong) => (
                      <SelectItem key={ong.id} value={ong.id}>
                        {ong.nome_fantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || loadingOngs}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando usuário...
            </>
          ) : (
            "Criar Usuário Master"
          )}
        </Button>
      </form>
    </Form>
  );
};