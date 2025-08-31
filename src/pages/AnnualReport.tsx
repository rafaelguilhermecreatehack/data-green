import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { ReportForm } from '@/components/forms/ReportForm'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useQuery } from '@tanstack/react-query'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface ReportData {
  year: string
  ongName: string
  presidentName: string
  presidentTitle: string
  foundationYear: string
  mission: string
  vision: string
  address: string
  phone: string
  email: string
  website: string
  facebook?: string
  instagram?: string
  youtube?: string
  linkedin?: string
  twitter?: string
  cebasNumber?: string
  utilityPublic?: string
  vicePresidentName?: string
  secretaryName?: string
  treasurerName?: string
  fiscalMember1?: string
  fiscalMember2?: string
  fiscalMember3?: string
  auditCompany?: string
  totalRevenue?: string
  totalExpenses?: string
  programExpenses?: string
  adminExpenses?: string
  fundraisingExpenses?: string
}

interface DatabaseStats {
  totalPeople: number
  totalProjects: number
  totalCommunities: number
  totalInvestors: number
  totalContributions: number
  totalContributionAmount: number
  activeProjects: number
  completedProjects: number
  peopleByGender: { masculino: number; feminino: number; outro: number; prefiro_nao_informar: number }
  projectsByCategory: Record<string, number>
  contributionsByMonth: Array<{ month: string; amount: number; count: number }>
}

export default function AnnualReport() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  // Fetch database statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['annual-report-stats'],
    queryFn: async (): Promise<DatabaseStats> => {
      // Get total counts
      const [
        { count: totalPeople },
        { count: totalProjects },
        { count: totalCommunities },
        { count: totalInvestors },
        { count: totalContributions }
      ] = await Promise.all([
        supabase.from('pessoas').select('*', { count: 'exact', head: true }),
        supabase.from('projetos').select('*', { count: 'exact', head: true }),
        supabase.from('comunidades').select('*', { count: 'exact', head: true }),
        supabase.from('investidores').select('*', { count: 'exact', head: true }),
        supabase.from('aportes').select('*', { count: 'exact', head: true })
      ])

      // Get contribution amount
      const { data: contributions } = await supabase
        .from('aportes')
        .select('valor_aporte')

      const totalContributionAmount = contributions?.reduce((sum, c) => sum + (c.valor_aporte || 0), 0) || 0

      // Get project status counts
      const { data: projects } = await supabase
        .from('projetos')
        .select('status, categoria')

      const activeProjects = projects?.filter(p => p.status === 'em_andamento').length || 0
      const completedProjects = projects?.filter(p => p.status === 'concluido').length || 0

      // Get people by gender
      const { data: people } = await supabase
        .from('pessoas')
        .select('genero')

      const peopleByGender = people?.reduce((acc, p) => {
        acc[p.genero as keyof typeof acc] = (acc[p.genero as keyof typeof acc] || 0) + 1
        return acc
      }, { masculino: 0, feminino: 0, outro: 0, prefiro_nao_informar: 0 }) || 
      { masculino: 0, feminino: 0, outro: 0, prefiro_nao_informar: 0 }

      // Get projects by category
      const projectsByCategory = projects?.reduce((acc, p) => {
        acc[p.categoria] = (acc[p.categoria] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Get contributions by month (for current year)
      const currentYear = new Date().getFullYear()
      const { data: monthlyContributions } = await supabase
        .from('aportes')
        .select('data_aporte, valor_aporte')
        .gte('data_aporte', `${currentYear}-01-01`)
        .lte('data_aporte', `${currentYear}-12-31`)

      const contributionsByMonth = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(currentYear, i).toLocaleString('pt-BR', { month: 'long' })
        const monthContributions = monthlyContributions?.filter(c => 
          new Date(c.data_aporte).getMonth() === i
        ) || []
        
        return {
          month,
          amount: monthContributions.reduce((sum, c) => sum + (c.valor_aporte || 0), 0),
          count: monthContributions.length
        }
      })

      return {
        totalPeople: totalPeople || 0,
        totalProjects: totalProjects || 0,
        totalCommunities: totalCommunities || 0,
        totalInvestors: totalInvestors || 0,
        totalContributions: totalContributions || 0,
        totalContributionAmount,
        activeProjects,
        completedProjects,
        peopleByGender,
        projectsByCategory,
        contributionsByMonth
      }
    }
  })

  const generatePDF = async (data: ReportData) => {
    setIsGenerating(true)
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const margin = 20
      let yPosition = 30

      // Helper function to add text with line breaks
      const addText = (text: string, x: number, y: number, options?: any) => {
        const maxWidth = pageWidth - 2 * margin
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y, options)
        return y + (lines.length * 6) + 2
      }

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > doc.internal.pageSize.height - margin) {
          doc.addPage()
          yPosition = 30
        }
      }

      // Title page
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text(`Relatório Anual ${data.year}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20
      
      doc.setFontSize(20)
      doc.text(data.ongName, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'italic')
      doc.text('Impacto, Fé e Transformação', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 30

      // Reset font for content
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)

      // Message from presidency
      checkNewPage(100)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('Mensagem da Presidência/Diretoria', margin, yPosition)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      yPosition += 10

      const presidencyMessage = `Com profunda gratidão e um coração cheio de esperança, apresentamos o Relatório Anual de Atividades de ${data.ongName} referente ao ano de ${data.year}. Este ano foi marcado por desafios significativos, mas também por inúmeras bênçãos e conquistas que reafirmam nosso compromisso inabalável com a missão que Deus nos confiou.

Em ${data.year}, testemunhamos a resiliência e a fé de comunidades que enfrentaram adversidades, e a capacidade de transformação que surge quando o amor e a solidariedade se unem. Nossos programas e projetos continuaram a ser faróis de esperança, alcançando milhares de vidas e promovendo mudanças duradouras.


Com gratidão e esperança,

${data.presidentName}
${data.presidentTitle}
${data.ongName}`

      yPosition = addText(presidencyMessage, margin, yPosition)

      // New page for "Who We Are"
      doc.addPage()
      yPosition = 30

      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('Quem Somos', margin, yPosition)

      doc.setFontSize(14)
      yPosition = addText('Nossa Missão', margin, yPosition + 15)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      yPosition = addText(data.mission, margin, yPosition + 5)

      yPosition += 15
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('Nossa Visão', margin, yPosition)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      yPosition = addText(data.vision, margin, yPosition + 5)

      // Values section
      yPosition += 15
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('Nossos Valores', margin, yPosition)

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      const values = `Nossa atuação é fundamentada em valores cristãos que guiam cada passo de nosso trabalho:

• Fé em Cristo: Acreditamos que a fé em Jesus Cristo é a base de nossa inspiração e força para servir ao próximo.
• Compromisso com os Vulneráveis: Priorizamos o atendimento e o apoio às pessoas em situação de maior vulnerabilidade.
• Integridade e Transparência: Atuamos com ética, responsabilidade e total transparência na gestão de nossos recursos.
• Amor e Compaixão: Demonstramos amor e compaixão em todas as nossas interações.
• Parceria e Colaboração: Acreditamos no poder da união e trabalhamos em parceria com indivíduos e comunidades.
• Transformação e Esperança: Buscamos promover mudanças duradouras na vida das pessoas.`

      yPosition = addText(values, margin, yPosition + 5)

      // Our Impact section with database statistics
      if (stats) {
        doc.addPage()
        yPosition = 30

        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        yPosition = addText('Nosso Impacto: Transformando Vidas', margin, yPosition)

        doc.setFontSize(14)
        yPosition = addText('Dados Quantitativos do Impacto:', margin, yPosition + 15)

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        const impactData = `• Pessoas Atendidas: ${stats.totalPeople} pessoas foram diretamente beneficiadas por nossos programas
• Projetos Realizados: ${stats.totalProjects} projetos em desenvolvimento, sendo ${stats.activeProjects} em andamento e ${stats.completedProjects} concluídos
• Comunidades Alcançadas: ${stats.totalCommunities} comunidades atendidas
• Investidores Parceiros: ${stats.totalInvestors} investidores apoiando nossos projetos
• Aportes Recebidos: ${stats.totalContributions} contribuições totalizando R$ ${stats.totalContributionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

        yPosition = addText(impactData, margin, yPosition + 5)

        // Demographics table
        yPosition += 20
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        yPosition = addText('Distribuição por Gênero:', margin, yPosition)

        const genderData = [
          ['Gênero', 'Quantidade'],
          ['Masculino', stats.peopleByGender.masculino.toString()],
          ['Feminino', stats.peopleByGender.feminino.toString()],
          ['Outro', stats.peopleByGender.outro.toString()],
          ['Prefiro não informar', stats.peopleByGender.prefiro_nao_informar.toString()]
        ]

        autoTable(doc, {
          head: [genderData[0]],
          body: genderData.slice(1),
          startY: yPosition + 5,
          theme: 'grid',
          styles: { fontSize: 10 }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 20

        // Projects by category
        if (Object.keys(stats.projectsByCategory).length > 0) {
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          yPosition = addText('Projetos por Categoria:', margin, yPosition)

          const categoryData = [
            ['Categoria', 'Quantidade'],
            ...Object.entries(stats.projectsByCategory).map(([category, count]) => [
              category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              count.toString()
            ])
          ]

          autoTable(doc, {
            head: [categoryData[0]],
            body: categoryData.slice(1),
            startY: yPosition + 5,
            theme: 'grid',
            styles: { fontSize: 10 }
          })

          yPosition = (doc as any).lastAutoTable.finalY + 20
        }
      }

      // Financial transparency section
      if (data.totalRevenue || data.totalExpenses) {
        checkNewPage(150)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        yPosition = addText('Transparência Financeira', margin, yPosition)

        doc.setFontSize(14)
        yPosition = addText('Demonstrativo Financeiro Simplificado:', margin, yPosition + 15)

        const financialData = [
          ['Descrição', 'Valor (R$)'],
          ['Receitas Totais', data.totalRevenue ? parseFloat(data.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'],
          ['Despesas Totais', data.totalExpenses ? parseFloat(data.totalExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'],
          ['Despesas com Programas', data.programExpenses ? parseFloat(data.programExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'],
          ['Despesas Administrativas', data.adminExpenses ? parseFloat(data.adminExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'],
          ['Despesas de Captação', data.fundraisingExpenses ? parseFloat(data.fundraisingExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00']
        ]

        autoTable(doc, {
          head: [financialData[0]],
          body: financialData.slice(1),
          startY: yPosition + 5,
          theme: 'grid',
          styles: { fontSize: 10 }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 20

        if (data.auditCompany) {
          doc.setFontSize(12)
          doc.setFont('helvetica', 'normal')
          yPosition = addText(`Auditoria Externa: Nossas contas são auditadas anualmente por ${data.auditCompany}.`, margin, yPosition)
        }
      }

      // Governance section
      if (data.vicePresidentName || data.secretaryName || data.treasurerName) {
        checkNewPage(100)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        yPosition = addText('Identidade Organizacional', margin, yPosition)

        doc.setFontSize(14)
        yPosition = addText('Conselho Administrativo:', margin, yPosition + 15)

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        let governance = `• ${data.presidentName} - ${data.presidentTitle}`
        if (data.vicePresidentName) governance += `\n• ${data.vicePresidentName} - Vice-Presidente`
        if (data.secretaryName) governance += `\n• ${data.secretaryName} - Secretário`
        if (data.treasurerName) governance += `\n• ${data.treasurerName} - Tesoureiro`

        yPosition = addText(governance, margin, yPosition + 5)

        if (data.fiscalMember1 || data.fiscalMember2 || data.fiscalMember3) {
          yPosition += 15
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          yPosition = addText('Conselho Fiscal:', margin, yPosition)

          doc.setFontSize(12)
          doc.setFont('helvetica', 'normal')
          let fiscal = ''
          if (data.fiscalMember1) fiscal += `• ${data.fiscalMember1} - Efetivo\n`
          if (data.fiscalMember2) fiscal += `• ${data.fiscalMember2} - Efetivo\n`
          if (data.fiscalMember3) fiscal += `• ${data.fiscalMember3} - Efetivo`

          yPosition = addText(fiscal, margin, yPosition + 5)
        }

        if (data.cebasNumber || data.utilityPublic) {
          yPosition += 15
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          yPosition = addText('Registros e Certificações:', margin, yPosition)

          doc.setFontSize(12)
          doc.setFont('helvetica', 'normal')
          let registrations = ''
          if (data.cebasNumber) registrations += `• CEBAS: ${data.cebasNumber}\n`
          if (data.utilityPublic) registrations += `• Utilidade Pública: ${data.utilityPublic}`

          yPosition = addText(registrations, margin, yPosition + 5)
        }
      }

      // Contact information
      doc.addPage()
      yPosition = 30

      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('Contato e Redes Sociais', margin, yPosition)

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      let contactInfo = `Endereço: ${data.address}
Telefone: ${data.phone}
E-mail: ${data.email}
Website: ${data.website}`

      yPosition = addText(contactInfo, margin, yPosition + 15)

      // Social media
      yPosition += 20
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      yPosition = addText('Redes Sociais:', margin, yPosition)

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      let socialMedia = ''
      if (data.facebook) socialMedia += `• Facebook: ${data.facebook}\n`
      if (data.instagram) socialMedia += `• Instagram: ${data.instagram}\n`
      if (data.youtube) socialMedia += `• YouTube: ${data.youtube}\n`
      if (data.linkedin) socialMedia += `• LinkedIn: ${data.linkedin}\n`
      if (data.twitter) socialMedia += `• Twitter: ${data.twitter}`

      if (socialMedia) {
        yPosition = addText(socialMedia, margin, yPosition + 5)
      }

      // Save the PDF
      const fileName = `relatorio-anual-${data.ongName.toLowerCase().replace(/\s+/g, '-')}-${data.year}.pdf`
      doc.save(fileName)

      toast({
        title: 'Relatório gerado com sucesso!',
        description: `O arquivo ${fileName} foi baixado.`,
      })

    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Ocorreu um erro ao gerar o PDF. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Relatório Anual</h1>
          <p className="text-muted-foreground mt-2">
            Gere um relatório anual completo com dados da organização e estatísticas do banco de dados.
          </p>
        </div>

        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando estatísticas...</span>
          </div>
        ) : (
          <ReportForm onSubmit={generatePDF} isGenerating={isGenerating} />
        )}

        {stats && (
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Prévia dos Dados (Ano Atual)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Pessoas:</span> {stats.totalPeople}
              </div>
              <div>
                <span className="font-medium">Projetos:</span> {stats.totalProjects}
              </div>
              <div>
                <span className="font-medium">Comunidades:</span> {stats.totalCommunities}
              </div>
              <div>
                <span className="font-medium">Investidores:</span> {stats.totalInvestors}
              </div>
              <div>
                <span className="font-medium">Aportes:</span> {stats.totalContributions}
              </div>
              <div>
                <span className="font-medium">Valor Total:</span> R$ {stats.totalContributionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div>
                <span className="font-medium">Projetos Ativos:</span> {stats.activeProjects}
              </div>
              <div>
                <span className="font-medium">Projetos Concluídos:</span> {stats.completedProjects}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
