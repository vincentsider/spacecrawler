export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          changes: Json | null
          content_id: string
          content_type: Database["public"]["Enums"]["crawler_type"]
          created_at: string | null
          id: string
          performed_by: string
          reason: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          content_id: string
          content_type: Database["public"]["Enums"]["crawler_type"]
          created_at?: string | null
          id?: string
          performed_by: string
          reason?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          content_id?: string
          content_type?: Database["public"]["Enums"]["crawler_type"]
          created_at?: string | null
          id?: string
          performed_by?: string
          reason?: string | null
        }
        Relationships: []
      }
      crawler_runs: {
        Row: {
          completed_at: string | null
          crawler_type: Database["public"]["Enums"]["crawler_type"]
          created_at: string | null
          error_message: string | null
          id: string
          items_found: number | null
          items_new: number | null
          items_updated: number | null
          logs: Json | null
          source_id: string | null
          started_at: string | null
          success: boolean | null
        }
        Insert: {
          completed_at?: string | null
          crawler_type: Database["public"]["Enums"]["crawler_type"]
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_found?: number | null
          items_new?: number | null
          items_updated?: number | null
          logs?: Json | null
          source_id?: string | null
          started_at?: string | null
          success?: boolean | null
        }
        Update: {
          completed_at?: string | null
          crawler_type?: Database["public"]["Enums"]["crawler_type"]
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_found?: number | null
          items_new?: number | null
          items_updated?: number | null
          logs?: Json | null
          source_id?: string | null
          started_at?: string | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "crawler_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "crawler_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      crawler_sources: {
        Row: {
          crawler_type: Database["public"]["Enums"]["crawler_type"]
          created_at: string | null
          id: string
          is_active: boolean | null
          last_crawled_at: string | null
          source_name: string
          source_url: string
          updated_at: string | null
        }
        Insert: {
          crawler_type: Database["public"]["Enums"]["crawler_type"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_crawled_at?: string | null
          source_name: string
          source_url: string
          updated_at?: string | null
        }
        Update: {
          crawler_type?: Database["public"]["Enums"]["crawler_type"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_crawled_at?: string | null
          source_name?: string
          source_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          crawled_at: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_date: string
          event_time: string | null
          external_id: string | null
          id: string
          image_url: string | null
          is_virtual: boolean | null
          location: string | null
          notes: string | null
          organizer: string | null
          price: string | null
          published_at: string | null
          registration_url: string
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          crawled_at?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date: string
          event_time?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_virtual?: boolean | null
          location?: string | null
          notes?: string | null
          organizer?: string | null
          price?: string | null
          published_at?: string | null
          registration_url: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          crawled_at?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_virtual?: boolean | null
          location?: string | null
          notes?: string | null
          organizer?: string | null
          price?: string | null
          published_at?: string | null
          registration_url?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "crawler_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_url: string
          company_name: string
          crawled_at: string | null
          created_at: string | null
          description: string | null
          external_id: string | null
          id: string
          location: string | null
          location_type: Database["public"]["Enums"]["job_location_type"] | null
          notes: string | null
          publication_date: string | null
          published_at: string | null
          requirements: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          salary_range: string | null
          source_id: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_url: string
          company_name: string
          crawled_at?: string | null
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          location?: string | null
          location_type?:
            | Database["public"]["Enums"]["job_location_type"]
            | null
          notes?: string | null
          publication_date?: string | null
          published_at?: string | null
          requirements?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          salary_range?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_url?: string
          company_name?: string
          crawled_at?: string | null
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          location?: string | null
          location_type?:
            | Database["public"]["Enums"]["job_location_type"]
            | null
          notes?: string | null
          publication_date?: string | null
          published_at?: string | null
          requirements?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          salary_range?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "crawler_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          company_name: string
          crawled_at: string | null
          created_at: string | null
          demo_url: string | null
          external_id: string | null
          full_description: string | null
          id: string
          key_features: string[] | null
          logo_url: string | null
          name: string
          notes: string | null
          pricing_model: string | null
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          screenshots: string[] | null
          short_description: string | null
          source_id: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          tagline: string | null
          updated_at: string | null
          use_cases: string[] | null
          website_url: string
        }
        Insert: {
          company_name: string
          crawled_at?: string | null
          created_at?: string | null
          demo_url?: string | null
          external_id?: string | null
          full_description?: string | null
          id?: string
          key_features?: string[] | null
          logo_url?: string | null
          name: string
          notes?: string | null
          pricing_model?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshots?: string[] | null
          short_description?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tagline?: string | null
          updated_at?: string | null
          use_cases?: string[] | null
          website_url: string
        }
        Update: {
          company_name?: string
          crawled_at?: string | null
          created_at?: string | null
          demo_url?: string | null
          external_id?: string | null
          full_description?: string | null
          id?: string
          key_features?: string[] | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          pricing_model?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshots?: string[] | null
          short_description?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          tagline?: string | null
          updated_at?: string | null
          use_cases?: string[] | null
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "crawler_sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      published_events: {
        Row: {
          crawled_at: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_date: string | null
          event_time: string | null
          external_id: string | null
          id: string | null
          image_url: string | null
          is_virtual: boolean | null
          location: string | null
          notes: string | null
          organizer: string | null
          price: string | null
          published_at: string | null
          registration_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string | null
          source_name: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "crawler_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      published_jobs: {
        Row: {
          application_url: string | null
          company_name: string | null
          crawled_at: string | null
          created_at: string | null
          description: string | null
          external_id: string | null
          id: string | null
          location: string | null
          location_type: Database["public"]["Enums"]["job_location_type"] | null
          notes: string | null
          publication_date: string | null
          published_at: string | null
          requirements: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          salary_range: string | null
          source_id: string | null
          source_name: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "crawler_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      published_products: {
        Row: {
          company_name: string | null
          crawled_at: string | null
          created_at: string | null
          demo_url: string | null
          external_id: string | null
          full_description: string | null
          id: string | null
          key_features: string[] | null
          logo_url: string | null
          name: string | null
          notes: string | null
          pricing_model: string | null
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          screenshots: string[] | null
          short_description: string | null
          source_id: string | null
          source_name: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          tagline: string | null
          updated_at: string | null
          use_cases: string[] | null
          website_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "crawler_sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      content_status: "pending" | "approved" | "rejected" | "published"
      crawler_type: "jobs" | "events" | "products"
      job_location_type: "remote" | "onsite" | "hybrid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_status: ["pending", "approved", "rejected", "published"],
      crawler_type: ["jobs", "events", "products"],
      job_location_type: ["remote", "onsite", "hybrid"],
    },
  },
} as const