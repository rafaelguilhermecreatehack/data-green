import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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

// Debounce utility function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export const UserRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ongs, setOngs] = useState<Ong[]>([]);
  const [loadingOngs, setLoadingOngs] = useState(true);
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
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

  // Real-time email validation
  const checkEmailExists = async (email: string) => {
    if (!email || email.length < 5 || !email.includes('@')) {
      setEmailCheckStatus('idle');
      setEmailExists(false);
      return;
    }

    setIsCheckingEmail(true);
    setEmailCheckStatus('checking');
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('email, id_ong_vinculada')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar email:', error);
        setEmailCheckStatus('idle');
        return;
      }

      const exists = !!data;
      setEmailExists(exists);
      setEmailCheckStatus(exists ? 'taken' : 'available');
      
      if (exists) {
        // Get ONG name for better user feedback
        const { data: ongData } = await supabase
          .from('ongs')
          .select('nome_fantasia')
          .eq('id', data.id_ong_vinculada)
          .single();
        
        const ongName = ongData?.nome_fantasia || 'uma ONG';
        form.setError('email', {
          type: 'manual',
          message: `Este email já está registrado para ${ongName}. Deseja fazer login?`
        });
      } else {
        form.clearErrors('email');
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      setEmailCheckStatus('idle');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Debounce email check
  const debouncedEmailCheck = useCallback(
    debounce((email: string) => checkEmailExists(email), 800),
    []
  );

  // Watch email field changes
  const emailValue = form.watch('email');
  useEffect(() => {
    if (emailValue && emailValue.length > 0) {
      debouncedEmailCheck(emailValue);
    } else {
      setEmailExists(false);
      setEmailCheckStatus('idle');
      form.clearErrors('email');
    }
  }, [emailValue, debouncedEmailCheck, form]);

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
    // Prevent submission if email is known to exist
    if (emailExists || emailCheckStatus === 'taken') {
      toast({
        title: "Email indisponível",
        description: "Este email já está registrado no sistema. Escolha outro email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Double-check email doesn't exist (in case of race conditions)
      const { data: existingUser } = await supabase
        .from("usuarios")
        .select("email, id_ong_vinculada")
        .eq("email", data.email.toLowerCase())
        .maybeSingle();

      if (existingUser) {
        const { data: ongData } = await supabase
          .from('ongs')
          .select('nome_fantasia')
          .eq('id', existingUser.id_ong_vinculada)
          .single();
        
        const ongName = ongData?.nome_fantasia || 'uma ONG';
        toast({
          title: "Email já cadastrado",
          description: `Este email já está registrado para ${ongName}.`,
          variant: "destructive",
        });
        setEmailCheckStatus('taken');
        setEmailExists(true);
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
                  <div className="relative">
                    <Input 
                      type="email" 
                      placeholder="joao@ong.com" 
                      {...field}
                      className={`pr-10 ${
                        emailCheckStatus === 'taken' ? 'border-destructive focus:border-destructive' : 
                        emailCheckStatus === 'available' ? 'border-green-500 focus:border-green-500' : ''
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {emailCheckStatus === 'checking' && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {emailCheckStatus === 'available' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {emailCheckStatus === 'taken' && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
                {emailCheckStatus === 'available' && !form.formState.errors.email && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Email disponível
                  </p>
                )}
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
          disabled={isSubmitting || loadingOngs || emailExists || emailCheckStatus === 'taken'}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando usuário...
            </>
          ) : emailExists || emailCheckStatus === 'taken' ? (
            <>
              <XCircle className="mr-2 h-4 w-4" />
              Email Indisponível
            </>
          ) : (
            "Criar Usuário Master"
          )}
        </Button>
        
        {(emailExists || emailCheckStatus === 'taken') && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>O email escolhido já está em uso. Escolha outro email para continuar.</span>
          </div>
        )}
      </form>
    </Form>
  );
};