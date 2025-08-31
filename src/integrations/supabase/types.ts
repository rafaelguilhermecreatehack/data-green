export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      aportes: {
        Row: {
          created_at: string | null
          data_aporte: string
          descricao: string | null
          id: string
          id_investidor: string
          id_projeto: string
          updated_at: string | null
          valor_aporte: number
        }
        Insert: {
          created_at?: string | null
          data_aporte?: string
          descricao?: string | null
          id?: string
          id_investidor: string
          id_projeto: string
          updated_at?: string | null
          valor_aporte: number
        }
        Update: {
          created_at?: string | null
          data_aporte?: string
          descricao?: string | null
          id?: string
          id_investidor?: string
          id_projeto?: string
          updated_at?: string | null
          valor_aporte?: number
        }
        Relationships: [
          {
            foreignKeyName: "aportes_id_investidor_fkey"
            columns: ["id_investidor"]
            isOneToOne: false
            referencedRelation: "investidores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aportes_id_projeto_fkey"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidades: {
        Row: {
          bairro: string
          cidade: string
          created_at: string | null
          estado: string
          id: string
          idh: number | null
          total_beneficiarios: number | null
          updated_at: string | null
        }
        Insert: {
          bairro: string
          cidade: string
          created_at?: string | null
          estado: string
          id?: string
          idh?: number | null
          total_beneficiarios?: number | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string
          cidade?: string
          created_at?: string | null
          estado?: string
          id?: string
          idh?: number | null
          total_beneficiarios?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      investidores: {
        Row: {
          contato: string | null
          created_at: string | null
          documento: string | null
          id: string
          nome_investidor: string
          tipo_investidor: Database["public"]["Enums"]["investor_type"]
          updated_at: string | null
        }
        Insert: {
          contato?: string | null
          created_at?: string | null
          documento?: string | null
          id?: string
          nome_investidor: string
          tipo_investidor: Database["public"]["Enums"]["investor_type"]
          updated_at?: string | null
        }
        Update: {
          contato?: string | null
          created_at?: string | null
          documento?: string | null
          id?: string
          nome_investidor?: string
          tipo_investidor?: Database["public"]["Enums"]["investor_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      ongs: {
        Row: {
          ativa: boolean | null
          categoria: Database["public"]["Enums"]["ong_category"]
          cnpj: string
          contato: string
          created_at: string | null
          endereco_sede: Json | null
          id: string
          nome_fantasia: string
          receita_anual: number | null
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          categoria: Database["public"]["Enums"]["ong_category"]
          cnpj: string
          contato: string
          created_at?: string | null
          endereco_sede?: Json | null
          id?: string
          nome_fantasia: string
          receita_anual?: number | null
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          categoria?: Database["public"]["Enums"]["ong_category"]
          cnpj?: string
          contato?: string
          created_at?: string | null
          endereco_sede?: Json | null
          id?: string
          nome_fantasia?: string
          receita_anual?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pessoas: {
        Row: {
          anos_estudo: number | null
          created_at: string | null
          data_nascimento: string
          faixa_renda_familiar:
            | Database["public"]["Enums"]["income_range"]
            | null
          genero: string | null
          id: string
          id_comunidade: string
          id_projeto_vinculado: string
          indicadores_saude: Json | null
          nivel_escolaridade:
            | Database["public"]["Enums"]["education_level"]
            | null
          nome_completo: string
          updated_at: string | null
        }
        Insert: {
          anos_estudo?: number | null
          created_at?: string | null
          data_nascimento: string
          faixa_renda_familiar?:
            | Database["public"]["Enums"]["income_range"]
            | null
          genero?: string | null
          id?: string
          id_comunidade: string
          id_projeto_vinculado: string
          indicadores_saude?: Json | null
          nivel_escolaridade?:
            | Database["public"]["Enums"]["education_level"]
            | null
          nome_completo: string
          updated_at?: string | null
        }
        Update: {
          anos_estudo?: number | null
          created_at?: string | null
          data_nascimento?: string
          faixa_renda_familiar?:
            | Database["public"]["Enums"]["income_range"]
            | null
          genero?: string | null
          id?: string
          id_comunidade?: string
          id_projeto_vinculado?: string
          indicadores_saude?: Json | null
          nivel_escolaridade?:
            | Database["public"]["Enums"]["education_level"]
            | null
          nome_completo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_id_comunidade_fkey"
            columns: ["id_comunidade"]
            isOneToOne: false
            referencedRelation: "comunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_id_projeto_vinculado_fkey"
            columns: ["id_projeto_vinculado"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          categoria: Database["public"]["Enums"]["ong_category"] | null
          created_at: string | null
          data_fim_prevista: string | null
          data_inicio: string | null
          escopo: string | null
          id: string
          id_comunidade: string
          id_ong_responsavel: string
          nome_projeto: string
          orcamento_total: number | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["ong_category"] | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_inicio?: string | null
          escopo?: string | null
          id?: string
          id_comunidade: string
          id_ong_responsavel: string
          nome_projeto: string
          orcamento_total?: number | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["ong_category"] | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_inicio?: string | null
          escopo?: string | null
          id?: string
          id_comunidade?: string
          id_ong_responsavel?: string
          nome_projeto?: string
          orcamento_total?: number | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_id_comunidade_fkey"
            columns: ["id_comunidade"]
            isOneToOne: false
            referencedRelation: "comunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_id_ong_responsavel_fkey"
            columns: ["id_ong_responsavel"]
            isOneToOne: false
            referencedRelation: "ongs"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          id_ong_vinculada: string | null
          nome: string
          papel: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          id_ong_vinculada?: string | null
          nome: string
          papel?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          id_ong_vinculada?: string | null
          nome?: string
          papel?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_usuarios_ong"
            columns: ["id_ong_vinculada"]
            isOneToOne: false
            referencedRelation: "ongs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_community_idh: {
        Args: { community_id: string }
        Returns: number
      }
      can_access_ong: {
        Args: { ong_id: string }
        Returns: boolean
      }
      get_user_ong: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      education_level:
        | "sem_escolaridade"
        | "fundamental_incompleto"
        | "fundamental_completo"
        | "medio_incompleto"
        | "medio_completo"
        | "superior_incompleto"
        | "superior_completo"
        | "pos_graduacao"
      income_range:
        | "ate_1_salario"
        | "1_2_salarios"
        | "2_3_salarios"
        | "3_5_salarios"
        | "acima_5_salarios"
      investor_type:
        | "pessoa_fisica"
        | "pessoa_juridica"
        | "governo"
        | "organismo_internacional"
      ong_category:
        | "educacao"
        | "saude"
        | "meio_ambiente"
        | "assistencia_social"
        | "cultura"
        | "direitos_humanos"
      project_status: "planejamento" | "em_andamento" | "concluido" | "suspenso"
      user_role: "admin_global" | "master_ong" | "colaborador_ong"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      education_level: [
        "sem_escolaridade",
        "fundamental_incompleto",
        "fundamental_completo",
        "medio_incompleto",
        "medio_completo",
        "superior_incompleto",
        "superior_completo",
        "pos_graduacao",
      ],
      income_range: [
        "ate_1_salario",
        "1_2_salarios",
        "2_3_salarios",
        "3_5_salarios",
        "acima_5_salarios",
      ],
      investor_type: [
        "pessoa_fisica",
        "pessoa_juridica",
        "governo",
        "organismo_internacional",
      ],
      ong_category: [
        "educacao",
        "saude",
        "meio_ambiente",
        "assistencia_social",
        "cultura",
        "direitos_humanos",
      ],
      project_status: ["planejamento", "em_andamento", "concluido", "suspenso"],
      user_role: ["admin_global", "master_ong", "colaborador_ong"],
    },
  },
} as const
