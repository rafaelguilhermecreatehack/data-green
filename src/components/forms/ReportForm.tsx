import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const reportSchema = z.object({
  year: z.string().min(4, 'Ano deve ter 4 dígitos'),
  ongName: z.string().min(1, 'Nome da ONG é obrigatório'),
  presidentName: z.string().min(1, 'Nome do presidente é obrigatório'),
  presidentTitle: z.string().min(1, 'Título do presidente é obrigatório'),
  foundationYear: z.string().min(4, 'Ano de fundação deve ter 4 dígitos'),
  mission: z.string().min(1, 'Missão é obrigatória'),
  vision: z.string().min(1, 'Visão é obrigatória'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido'),
  website: z.string().url('Website deve ser uma URL válida'),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  cebasNumber: z.string().optional(),
  utilityPublic: z.string().optional(),
  vicePresidentName: z.string().optional(),
  secretaryName: z.string().optional(),
  treasurerName: z.string().optional(),
  fiscalMember1: z.string().optional(),
  fiscalMember2: z.string().optional(),
  fiscalMember3: z.string().optional(),
  auditCompany: z.string().optional(),
  totalRevenue: z.string().optional(),
  totalExpenses: z.string().optional(),
  programExpenses: z.string().optional(),
  adminExpenses: z.string().optional(),
  fundraisingExpenses: z.string().optional(),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportFormProps {
  onSubmit: (data: ReportFormData) => void
  isGenerating: boolean
}

export function ReportForm({ onSubmit, isGenerating }: ReportFormProps) {
  const [activeSection, setActiveSection] = useState('basic')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      ongName: 'Data Green',
      presidentTitle: 'Presidente',
      foundationYear: '2020',
    }
  })

  const sections = [
    { id: 'basic', label: 'Informações Básicas' },
    { id: 'identity', label: 'Identidade Organizacional' },
    { id: 'governance', label: 'Governança' },
    { id: 'financial', label: 'Financeiro' },
    { id: 'contact', label: 'Contato e Redes Sociais' }
  ]

  const renderBasicSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Ano do Relatório</Label>
          <Input
            id="year"
            type="number"
            {...register('year')}
            className={errors.year ? 'border-red-500' : ''}
          />
          {errors.year && <p className="text-sm text-red-500 mt-1">{errors.year.message}</p>}
        </div>
        <div>
          <Label htmlFor="ongName">Nome da ONG</Label>
          <Input
            id="ongName"
            {...register('ongName')}
            className={errors.ongName ? 'border-red-500' : ''}
          />
          {errors.ongName && <p className="text-sm text-red-500 mt-1">{errors.ongName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="presidentName">Nome do Presidente/Diretor</Label>
          <Input
            id="presidentName"
            {...register('presidentName')}
            className={errors.presidentName ? 'border-red-500' : ''}
          />
          {errors.presidentName && <p className="text-sm text-red-500 mt-1">{errors.presidentName.message}</p>}
        </div>
        <div>
          <Label htmlFor="presidentTitle">Título (Presidente/Diretor)</Label>
          <Input
            id="presidentTitle"
            {...register('presidentTitle')}
            className={errors.presidentTitle ? 'border-red-500' : ''}
          />
          {errors.presidentTitle && <p className="text-sm text-red-500 mt-1">{errors.presidentTitle.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="foundationYear">Ano de Fundação</Label>
        <Input
          id="foundationYear"
          type="number"
          {...register('foundationYear')}
          className={errors.foundationYear ? 'border-red-500' : ''}
        />
        {errors.foundationYear && <p className="text-sm text-red-500 mt-1">{errors.foundationYear.message}</p>}
      </div>

      <div>
        <Label htmlFor="mission">Missão</Label>
        <Textarea
          id="mission"
          {...register('mission')}
          className={errors.mission ? 'border-red-500' : ''}
          rows={3}
          placeholder="Descreva a missão da organização..."
        />
        {errors.mission && <p className="text-sm text-red-500 mt-1">{errors.mission.message}</p>}
      </div>

      <div>
        <Label htmlFor="vision">Visão</Label>
        <Textarea
          id="vision"
          {...register('vision')}
          className={errors.vision ? 'border-red-500' : ''}
          rows={3}
          placeholder="Descreva a visão da organização..."
        />
        {errors.vision && <p className="text-sm text-red-500 mt-1">{errors.vision.message}</p>}
      </div>
    </div>
  )

  const renderIdentitySection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cebasNumber">CEBAS (Número)</Label>
          <Input
            id="cebasNumber"
            {...register('cebasNumber')}
            placeholder="Número do certificado CEBAS"
          />
        </div>
        <div>
          <Label htmlFor="utilityPublic">Utilidade Pública</Label>
          <Input
            id="utilityPublic"
            {...register('utilityPublic')}
            placeholder="Municipal/Estadual/Federal - Número do decreto"
          />
        </div>
      </div>
    </div>
  )

  const renderGovernanceSection = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Conselho Administrativo</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vicePresidentName">Vice-Presidente</Label>
          <Input
            id="vicePresidentName"
            {...register('vicePresidentName')}
            placeholder="Nome do vice-presidente"
          />
        </div>
        <div>
          <Label htmlFor="secretaryName">Secretário</Label>
          <Input
            id="secretaryName"
            {...register('secretaryName')}
            placeholder="Nome do secretário"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="treasurerName">Tesoureiro</Label>
        <Input
          id="treasurerName"
          {...register('treasurerName')}
          placeholder="Nome do tesoureiro"
        />
      </div>

      <h4 className="font-medium text-lg mt-6">Conselho Fiscal</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fiscalMember1">Membro Efetivo 1</Label>
          <Input
            id="fiscalMember1"
            {...register('fiscalMember1')}
            placeholder="Nome do membro 1"
          />
        </div>
        <div>
          <Label htmlFor="fiscalMember2">Membro Efetivo 2</Label>
          <Input
            id="fiscalMember2"
            {...register('fiscalMember2')}
            placeholder="Nome do membro 2"
          />
        </div>
        <div>
          <Label htmlFor="fiscalMember3">Membro Efetivo 3</Label>
          <Input
            id="fiscalMember3"
            {...register('fiscalMember3')}
            placeholder="Nome do membro 3"
          />
        </div>
      </div>
    </div>
  )

  const renderFinancialSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="auditCompany">Empresa de Auditoria</Label>
        <Input
          id="auditCompany"
          {...register('auditCompany')}
          placeholder="Nome da empresa de auditoria externa"
        />
      </div>

      <h4 className="font-medium text-lg">Demonstrativo Financeiro</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalRevenue">Receitas Totais (R$)</Label>
          <Input
            id="totalRevenue"
            {...register('totalRevenue')}
            placeholder="0,00"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="totalExpenses">Despesas Totais (R$)</Label>
          <Input
            id="totalExpenses"
            {...register('totalExpenses')}
            placeholder="0,00"
            type="number"
            step="0.01"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="programExpenses">Despesas com Programas (R$)</Label>
          <Input
            id="programExpenses"
            {...register('programExpenses')}
            placeholder="0,00"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="adminExpenses">Despesas Administrativas (R$)</Label>
          <Input
            id="adminExpenses"
            {...register('adminExpenses')}
            placeholder="0,00"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="fundraisingExpenses">Despesas de Captação (R$)</Label>
          <Input
            id="fundraisingExpenses"
            {...register('fundraisingExpenses')}
            placeholder="0,00"
            type="number"
            step="0.01"
          />
        </div>
      </div>
    </div>
  )

  const renderContactSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Endereço Completo</Label>
        <Textarea
          id="address"
          {...register('address')}
          className={errors.address ? 'border-red-500' : ''}
          rows={2}
          placeholder="Endereço completo com cidade, estado e CEP"
        />
        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register('phone')}
            className={errors.phone ? 'border-red-500' : ''}
            placeholder="(11) 99999-9999"
          />
          {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
            placeholder="contato@ong.org.br"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          {...register('website')}
          className={errors.website ? 'border-red-500' : ''}
          placeholder="https://www.ong.org.br"
        />
        {errors.website && <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>}
      </div>

      <h4 className="font-medium text-lg">Redes Sociais</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            {...register('facebook')}
            placeholder="https://facebook.com/ong"
          />
        </div>
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            {...register('instagram')}
            placeholder="https://instagram.com/ong"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="youtube">YouTube</Label>
          <Input
            id="youtube"
            {...register('youtube')}
            placeholder="https://youtube.com/ong"
          />
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            {...register('linkedin')}
            placeholder="https://linkedin.com/company/ong"
          />
        </div>
        <div>
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            {...register('twitter')}
            placeholder="https://twitter.com/ong"
          />
        </div>
      </div>
    </div>
  )

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'basic':
        return renderBasicSection()
      case 'identity':
        return renderIdentitySection()
      case 'governance':
        return renderGovernanceSection()
      case 'financial':
        return renderFinancialSection()
      case 'contact':
        return renderContactSection()
      default:
        return renderBasicSection()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Configurações do Relatório Anual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {sections.map((section) => (
              <Button
                key={section.id}
                type="button"
                variant={activeSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </div>

          {/* Current Section Content */}
          <div className="min-h-[400px]">
            {renderCurrentSection()}
          </div>

          {/* Required Fields Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Por favor, preencha todos os campos obrigatórios marcados em vermelho.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Gerar Relatório PDF
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
