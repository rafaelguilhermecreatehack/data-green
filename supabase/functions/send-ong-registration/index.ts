import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OngRegistrationRequest {
  nomeOng: string;
  cnpj: string;
  categoria: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  descricaoAtividades: string;
  receitaAnual: string;
  responsavelNome: string;
  responsavelCargo: string;
  responsavelEmail: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const registrationData: OngRegistrationRequest = await req.json();
    
    console.log("Processing ONG registration:", registrationData.nomeOng);

    // Format category for display
    const categoriaMap: Record<string, string> = {
      "educacao": "Educação",
      "saude": "Saúde", 
      "meio_ambiente": "Meio Ambiente",
      "assistencia_social": "Assistência Social",
      "cultura": "Cultura",
      "esporte": "Esporte",
      "outros": "Outros"
    };

    // Format revenue for display
    const receitaMap: Record<string, string> = {
      "ate_50k": "Até R$ 50.000",
      "50k_100k": "R$ 50.000 - R$ 100.000", 
      "100k_500k": "R$ 100.000 - R$ 500.000",
      "500k_1m": "R$ 500.000 - R$ 1.000.000",
      "acima_1m": "Acima de R$ 1.000.000"
    };

    const emailContent = `
      <h1>Nova Solicitação de Cadastro de ONG - Data Green</h1>
      
      <h2>📋 Dados da Organização</h2>
      <p><strong>Nome da ONG:</strong> ${registrationData.nomeOng}</p>
      <p><strong>CNPJ:</strong> ${registrationData.cnpj}</p>
      <p><strong>Categoria:</strong> ${categoriaMap[registrationData.categoria] || registrationData.categoria}</p>
      <p><strong>Email:</strong> ${registrationData.email}</p>
      <p><strong>Telefone:</strong> ${registrationData.telefone}</p>
      
      <h2>📍 Endereço</h2>
      <p><strong>Endereço:</strong> ${registrationData.endereco}</p>
      <p><strong>Cidade:</strong> ${registrationData.cidade}</p>
      <p><strong>Estado:</strong> ${registrationData.estado}</p>
      <p><strong>CEP:</strong> ${registrationData.cep}</p>
      
      <h2>ℹ️ Informações Adicionais</h2>
      <p><strong>Descrição das Atividades:</strong></p>
      <p style="background-color: #f5f5f5; padding: 10px; border-left: 3px solid #007bff;">
        ${registrationData.descricaoAtividades}
      </p>
      <p><strong>Receita Anual Estimada:</strong> ${receitaMap[registrationData.receitaAnual] || registrationData.receitaAnual}</p>
      
      <h2>👤 Responsável pelo Cadastro</h2>
      <p><strong>Nome:</strong> ${registrationData.responsavelNome}</p>
      <p><strong>Cargo:</strong> ${registrationData.responsavelCargo}</p>
      <p><strong>Email:</strong> ${registrationData.responsavelEmail}</p>
      
      <hr style="margin: 20px 0;">
      <p><small><strong>Data do Cadastro:</strong> ${new Date(registrationData.timestamp).toLocaleString('pt-BR')}</small></p>
      <p><small>Este cadastro foi enviado através da plataforma Data Green.</small></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Data Green <onboarding@resend.dev>",
      to: ["rafael.guilherme.createhack@gmail.com"],
      subject: `Nova Solicitação de Cadastro: ${registrationData.nomeOng}`,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to the ONG
    const confirmationEmailContent = `
      <h1>Cadastro Recebido - Data Green</h1>
      
      <p>Olá, <strong>${registrationData.responsavelNome}</strong>!</p>
      
      <p>Recebemos a solicitação de cadastro da <strong>${registrationData.nomeOng}</strong> em nossa plataforma.</p>
      
      <p>Nossa equipe irá analisar as informações fornecidas e entrar em contato em breve através do email: <strong>${registrationData.responsavelEmail}</strong></p>
      
      <h2>📋 Resumo do Cadastro</h2>
      <p><strong>ONG:</strong> ${registrationData.nomeOng}</p>
      <p><strong>CNPJ:</strong> ${registrationData.cnpj}</p>
      <p><strong>Categoria:</strong> ${categoriaMap[registrationData.categoria] || registrationData.categoria}</p>
      <p><strong>Responsável:</strong> ${registrationData.responsavelNome} (${registrationData.responsavelCargo})</p>
      
      <p>Agradecemos o interesse em nossa plataforma!</p>
      
      <p>Atenciosamente,<br>
      <strong>Equipe Data Green</strong></p>
      
      <hr>
      <p><small>Data: ${new Date(registrationData.timestamp).toLocaleString('pt-BR')}</small></p>
    `;

    await resend.emails.send({
      from: "Data Green <onboarding@resend.dev>",
      to: [registrationData.responsavelEmail],
      subject: "Cadastro Recebido - Data Green",
      html: confirmationEmailContent,
    });

    console.log("Confirmation email sent to ONG");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cadastro enviado com sucesso!" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-ong-registration function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor",
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);