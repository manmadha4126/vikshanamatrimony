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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_recommendations: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          shown_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          shown_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          shown_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_recommendations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          status: string | null
          to_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          status?: string | null
          to_profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          status?: string | null
          to_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interests_to_profile_id_fkey"
            columns: ["to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          from_user_id: string
          id: string
          is_read: boolean | null
          to_user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          from_user_id: string
          id?: string
          is_read?: boolean | null
          to_user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          from_user_id?: string
          id?: string
          is_read?: boolean | null
          to_user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          related_profile_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_profile_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_profile_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_profile_id_fkey"
            columns: ["related_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_preferences: {
        Row: {
          age_from: number | null
          age_to: number | null
          annual_income: string | null
          caste: string[] | null
          country: string[] | null
          created_at: string
          dosham: string | null
          drinking_habits: string | null
          eating_habits: string[] | null
          education: string[] | null
          employed_in: string | null
          height_from: string | null
          height_to: string | null
          id: string
          is_compulsory: boolean | null
          marital_status: string[] | null
          mother_tongue: string[] | null
          occupation: string | null
          physical_status: string | null
          profile_id: string | null
          religion: string[] | null
          residing_state: string[] | null
          smoking_habits: string | null
          star: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_from?: number | null
          age_to?: number | null
          annual_income?: string | null
          caste?: string[] | null
          country?: string[] | null
          created_at?: string
          dosham?: string | null
          drinking_habits?: string | null
          eating_habits?: string[] | null
          education?: string[] | null
          employed_in?: string | null
          height_from?: string | null
          height_to?: string | null
          id?: string
          is_compulsory?: boolean | null
          marital_status?: string[] | null
          mother_tongue?: string[] | null
          occupation?: string | null
          physical_status?: string | null
          profile_id?: string | null
          religion?: string[] | null
          residing_state?: string[] | null
          smoking_habits?: string | null
          star?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_from?: number | null
          age_to?: number | null
          annual_income?: string | null
          caste?: string[] | null
          country?: string[] | null
          created_at?: string
          dosham?: string | null
          drinking_habits?: string | null
          eating_habits?: string[] | null
          education?: string[] | null
          employed_in?: string | null
          height_from?: string | null
          height_to?: string | null
          id?: string
          is_compulsory?: boolean | null
          marital_status?: string[] | null
          mother_tongue?: string[] | null
          occupation?: string | null
          physical_status?: string | null
          profile_id?: string | null
          religion?: string[] | null
          residing_state?: string[] | null
          smoking_habits?: string | null
          star?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          viewed_at: string
          viewed_profile_id: string
          viewer_id: string
        }
        Insert: {
          id?: string
          viewed_at?: string
          viewed_profile_id: string
          viewer_id: string
        }
        Update: {
          id?: string
          viewed_at?: string
          viewed_profile_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          admin_notes: string | null
          annual_income: string | null
          caste: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          dosham: string | null
          education: string | null
          education_detail: string | null
          email: string
          email_otp: string | null
          email_verified: boolean | null
          employment_type: string | null
          family_status: string | null
          family_type: string | null
          gender: string
          gothram: string | null
          height: string | null
          hobbies: string[] | null
          horoscope_url: string | null
          id: string
          is_complete: boolean | null
          is_prime: boolean | null
          marital_status: string | null
          mother_tongue: string | null
          name: string
          occupation: string | null
          otp_expires_at: string | null
          phone: string
          phone_otp: string | null
          phone_verified: boolean | null
          photo_url: string | null
          prime_expires_at: string | null
          profile_completion_percentage: number | null
          profile_for: string | null
          profile_id: string | null
          registration_step: number | null
          religion: string | null
          star: string | null
          state: string | null
          sub_caste: string | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          about_me?: string | null
          admin_notes?: string | null
          annual_income?: string | null
          caste?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          dosham?: string | null
          education?: string | null
          education_detail?: string | null
          email: string
          email_otp?: string | null
          email_verified?: boolean | null
          employment_type?: string | null
          family_status?: string | null
          family_type?: string | null
          gender: string
          gothram?: string | null
          height?: string | null
          hobbies?: string[] | null
          horoscope_url?: string | null
          id?: string
          is_complete?: boolean | null
          is_prime?: boolean | null
          marital_status?: string | null
          mother_tongue?: string | null
          name: string
          occupation?: string | null
          otp_expires_at?: string | null
          phone: string
          phone_otp?: string | null
          phone_verified?: boolean | null
          photo_url?: string | null
          prime_expires_at?: string | null
          profile_completion_percentage?: number | null
          profile_for?: string | null
          profile_id?: string | null
          registration_step?: number | null
          religion?: string | null
          star?: string | null
          state?: string | null
          sub_caste?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          about_me?: string | null
          admin_notes?: string | null
          annual_income?: string | null
          caste?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          dosham?: string | null
          education?: string | null
          education_detail?: string | null
          email?: string
          email_otp?: string | null
          email_verified?: boolean | null
          employment_type?: string | null
          family_status?: string | null
          family_type?: string | null
          gender?: string
          gothram?: string | null
          height?: string | null
          hobbies?: string[] | null
          horoscope_url?: string | null
          id?: string
          is_complete?: boolean | null
          is_prime?: boolean | null
          marital_status?: string | null
          mother_tongue?: string | null
          name?: string
          occupation?: string | null
          otp_expires_at?: string | null
          phone?: string
          phone_otp?: string | null
          phone_verified?: boolean | null
          photo_url?: string | null
          prime_expires_at?: string | null
          profile_completion_percentage?: number | null
          profile_for?: string | null
          profile_id?: string | null
          registration_step?: number | null
          religion?: string | null
          star?: string | null
          state?: string | null
          sub_caste?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      shortlisted_profiles: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlisted_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      success_stories: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          partner_name: string
          photo_url: string | null
          status: string
          story: string
          updated_at: string
          user_id: string
          wedding_date: string
          wedding_location: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          partner_name: string
          photo_url?: string | null
          status?: string
          story: string
          updated_at?: string
          user_id: string
          wedding_date: string
          wedding_location: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          partner_name?: string
          photo_url?: string | null
          status?: string
          story?: string
          updated_at?: string
          user_id?: string
          wedding_date?: string
          wedding_location?: string
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
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          profile_id: string
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          profile_id: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          profile_id?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completion: {
        Args: { p_profile_id: string }
        Returns: number
      }
      generate_profile_id: { Args: { p_gender: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
