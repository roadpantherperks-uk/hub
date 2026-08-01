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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      driver_signups: {
        Row: {
          admin_note: string | null
          created_at: string
          driver_type: string
          driver_type_other: string | null
          email: string
          full_name: string
          id: string
          location: string
          location_other: string | null
          phone: string
          status: Database["public"]["Enums"]["signup_status"]
          verification_file_url: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          driver_type: string
          driver_type_other?: string | null
          email: string
          full_name: string
          id?: string
          location: string
          location_other?: string | null
          phone: string
          status?: Database["public"]["Enums"]["signup_status"]
          verification_file_url?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          driver_type?: string
          driver_type_other?: string | null
          email?: string
          full_name?: string
          id?: string
          location?: string
          location_other?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["signup_status"]
          verification_file_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          id: string
          first_name: string
          surname: string
          email: string
          phone: string
          driver_type: string
          driver_type_other: string | null
          location: string
          location_other: string | null
          verification_doc_url: string
          status: Database["public"]["Enums"]["signup_status"]
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          surname: string
          email: string
          phone: string
          driver_type: string
          driver_type_other?: string | null
          location: string
          location_other?: string | null
          verification_doc_url: string
          status?: Database["public"]["Enums"]["signup_status"]
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          surname?: string
          email?: string
          phone?: string
          driver_type?: string
          driver_type_other?: string | null
          location?: string
          location_other?: string | null
          verification_doc_url?: string
          status?: Database["public"]["Enums"]["signup_status"]
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          name: string
          slug: string
          contact_name: string | null
          contact_email: string
          contact_phone: string | null
          website: string | null
          description: string | null
          category: string | null
          category_other: string | null
          location: string | null
          logo_url: string | null
          status: Database["public"]["Enums"]["business_status"]
          plan: string
          billing_status: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_checkout_session_id: string | null
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          contact_name?: string | null
          contact_email: string
          contact_phone?: string | null
          website?: string | null
          description?: string | null
          category?: string | null
          category_other?: string | null
          location?: string | null
          logo_url?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          plan?: string
          billing_status?: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_checkout_session_id?: string | null
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          contact_name?: string | null
          contact_email?: string
          contact_phone?: string | null
          website?: string | null
          description?: string | null
          category?: string | null
          category_other?: string | null
          location?: string | null
          logo_url?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          plan?: string
          billing_status?: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_checkout_session_id?: string | null
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_users: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_users_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_relationships: {
        Row: {
          id: string
          business_id: string
          type: Database["public"]["Enums"]["relationship_type"]
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          type: Database["public"]["Enums"]["relationship_type"]
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          type?: Database["public"]["Enums"]["relationship_type"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_relationships_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      perk_categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      perks: {
        Row: {
          id: string
          business_id: string
          category_id: string | null
          title: string
          summary: string | null
          description: string | null
          discount_label: string | null
          terms: string | null
          redemption_type: string
          code: string | null
          link: string | null
          location_label: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          category_id?: string | null
          title: string
          summary?: string | null
          description?: string | null
          discount_label?: string | null
          terms?: string | null
          redemption_type?: string
          code?: string | null
          link?: string | null
          location_label?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          category_id?: string | null
          title?: string
          summary?: string | null
          description?: string | null
          discount_label?: string | null
          terms?: string | null
          redemption_type?: string
          code?: string | null
          link?: string | null
          location_label?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "perk_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "driver" | "business"
      signup_status: "pending" | "approved" | "rejected"
      business_status: "pending" | "approved" | "rejected" | "suspended"
      billing_status: "none" | "checkout_started" | "active" | "past_due" | "canceled"
      relationship_type: "perk_partner" | "service_provider" | "sponsor"
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
      app_role: ["admin", "user", "driver", "business"],
      signup_status: ["pending", "approved", "rejected"],
      business_status: ["pending", "approved", "rejected", "suspended"],
      billing_status: ["none", "checkout_started", "active", "past_due", "canceled"],
      relationship_type: ["perk_partner", "service_provider", "sponsor"],
    },
  },
} as const
