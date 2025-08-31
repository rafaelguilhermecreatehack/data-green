import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const strategicReportSchema = z.object({
  // Período do relatório
  dataInicio: z.date({
    required_error: "Data de início é obrigatória",
  }),
  dataFim: z.date({
    required_error: "Data de fim é obrigatória",
  }),
  
  // Informações organizacionais
  nomeOrganizacao: z.string().min(1, "Nome da organização é obrigatório"),
  presidente: z.string().min(1, "Nome do presidente é obrigatório"),
  missao: z.string().min(1, "Missão é obrigatória"),
  visao: z.string().min(1, "Visão é obrigatória"),
  
  // Seções do relatório
  incluirDashboard: z.boolean().default(true),
  incluirEvolucaoProjetos: z.boolean().default(true),
  incluirEvolucaoPessoas: z.boolean().default(true),
  incluirAnaliseFinanceira: z.boolean().default(true),
  incluirInsightsEstrategicos: z.boolean().default(true),
  incluirRecomendacoes: z.boolean().default(true),
  
  // Contexto adicional
  contextoPeriodo: z.string().optional(),
  objetivosAlcancados: z.string().optional(),
  desafiosEnfrentados: z.string().optional(),
  proximosPassos: z.string().optional(),
});

type StrategicReportFormData = z.infer<typeof strategicReportSchema>;

interface StrategicReportFormProps {
  onSubmit: (data: StrategicReportFormData) => void;
  loading?: boolean;
}

const StrategicReportForm = ({ onSubmit, loading = false }: StrategicReportFormProps) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StrategicReportFormData>({
    resolver: zodResolver(strategicReportSchema),
    defaultValues: {
      dataInicio: new Date(new Date().getFullYear(), 0, 1), // Início do ano atual
      dataFim: new Date(), // Data atual
      incluirDashboard: true,
      incluirEvolucaoProjetos: true,
      incluirEvolucaoPessoas: true,
      incluirAnaliseFinanceira: true,
      incluirInsightsEstrategicos: true,
      incluirRecomendacoes: true,
    },
  });

  const watchedStartDate = watch("dataInicio");
  const watchedEndDate = watch("dataFim");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Período do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Período do Relatório</CardTitle>
          <CardDescription>
            Defina o período para análise dos dados e evolução
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedStartDate ? (
                      format(watchedStartDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedStartDate}
                    onSelect={(date) => {
                      setValue("dataInicio", date || new Date());
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dataInicio && (
                <p className="text-sm text-destructive">{errors.dataInicio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedEndDate ? (
                      format(watchedEndDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedEndDate}
                    onSelect={(date) => {
                      setValue("dataFim", date || new Date());
                      setEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dataFim && (
                <p className="text-sm text-destructive">{errors.dataFim.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Organizacionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Organizacionais</CardTitle>
          <CardDescription>
            Dados da organização que serão incluídos no relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeOrganizacao">Nome da Organização</Label>
              <Input
                id="nomeOrganizacao"
                placeholder="Ex: Data Green"
                {...register("nomeOrganizacao")}
              />
              {errors.nomeOrganizacao && (
                <p className="text-sm text-destructive">{errors.nomeOrganizacao.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="presidente">Presidente/Diretor</Label>
              <Input
                id="presidente"
                placeholder="Nome do presidente ou diretor"
                {...register("presidente")}
              />
              {errors.presidente && (
                <p className="text-sm text-destructive">{errors.presidente.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="missao">Missão</Label>
            <Textarea
              id="missao"
              placeholder="Descreva a missão da organização"
              {...register("missao")}
            />
            {errors.missao && (
              <p className="text-sm text-destructive">{errors.missao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visao">Visão</Label>
            <Textarea
              id="visao"
              placeholder="Descreva a visão da organização"
              {...register("visao")}
            />
            {errors.visao && (
              <p className="text-sm text-destructive">{errors.visao.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seções do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Seções do Relatório</CardTitle>
          <CardDescription>
            Selecione quais seções incluir no relatório estratégico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluirDashboard"
                {...register("incluirDashboard")}
                defaultChecked={true}
              />
              <Label htmlFor="incluirDashboard">Métricas do Dashboard</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluirEvolucaoProjetos"
                {...register("incluirEvolucaoProjetos")}
                defaultChecked={true}
              />
              <Label htmlFor="incluirEvolucaoProjetos">Evolução de Projetos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluirEvolucaoPessoas"
                {...register("incluirEvolucaoPessoas")}
                defaultChecked={true}
              />
              <Label htmlFor="incluirEvolucaoPessoas">Evolução de Pessoas</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluirAnaliseFinanceira"
                {...register("incluirAnaliseFinanceira")}
                defaultChecked={true}
              />
              <Label htmlFor="incluirAnaliseFinanceira">Análise Financeira</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluirInsightsEstrategicos"
                {...register("incluirInsightsEstrategicos")}
                defaultChecked={true}
              />
              <Label htmlFor="incluirInsightsEstrategicos">Insights Estratégicos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="incluirRecomendacoes"
                {...register("incluirRecomendacoes")}
                defaultChecked={true}
              />
              <Label htmlFor="incluirRecomendacoes">Recomendações</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contexto Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Contexto Adicional</CardTitle>
          <CardDescription>
            Informações complementares para enriquecer o relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contextoPeriodo">Contexto do Período</Label>
            <Textarea
              id="contextoPeriodo"
              placeholder="Descreva o contexto geral do período analisado"
              {...register("contextoPeriodo")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivosAlcancados">Principais Objetivos Alcançados</Label>
            <Textarea
              id="objetivosAlcancados"
              placeholder="Liste os principais objetivos alcançados no período"
              {...register("objetivosAlcancados")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desafiosEnfrentados">Desafios Enfrentados</Label>
            <Textarea
              id="desafiosEnfrentados"
              placeholder="Descreva os principais desafios enfrentados"
              {...register("desafiosEnfrentados")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proximosPassos">Próximos Passos</Label>
            <Textarea
              id="proximosPassos"
              placeholder="Descreva os próximos passos e planos futuros"
              {...register("proximosPassos")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? "Gerando..." : "Gerar Relatório"}
        </Button>
      </div>
    </form>
  );
};

export default StrategicReportForm;
