export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string | null;
          country: number | null;
          created_at: string;
          house_number: string | null;
          id: number;
          postal_code: string | null;
          state: string | null;
          street_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          city?: string | null;
          country?: number | null;
          created_at?: string;
          house_number?: string | null;
          id?: number;
          postal_code?: string | null;
          state?: string | null;
          street_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          city?: string | null;
          country?: number | null;
          created_at?: string;
          house_number?: string | null;
          id?: number;
          postal_code?: string | null;
          state?: string | null;
          street_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_country_fkey";
            columns: ["country"];
            isOneToOne: false;
            referencedRelation: "countries";
            referencedColumns: ["id"];
          },
        ];
      };
      chronicle_entities: {
        Row: {
          chronicle_id: number | null;
          created_at: string;
          entity_id: number | null;
          id: number;
        };
        Insert: {
          chronicle_id?: number | null;
          created_at?: string;
          entity_id?: number | null;
          id?: number;
        };
        Update: {
          chronicle_id?: number | null;
          created_at?: string;
          entity_id?: number | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "chronicle_entities_chronicle_id_fkey";
            columns: ["chronicle_id"];
            isOneToOne: false;
            referencedRelation: "chronicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chronicle_entities_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: false;
            referencedRelation: "entities";
            referencedColumns: ["id"];
          },
        ];
      };
      chronicles: {
        Row: {
          category: Database["public"]["Enums"]["chronicle_category"] | null;
          created_at: string | null;
          description: string | null;
          id: number;
          knots: string[];
          scope: Database["public"]["Enums"]["scope"];
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category?: Database["public"]["Enums"]["chronicle_category"] | null;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          knots: string[];
          scope?: Database["public"]["Enums"]["scope"];
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["chronicle_category"] | null;
          created_at?: string | null;
          description?: string | null;
          id?: number;
          knots?: string[];
          scope?: Database["public"]["Enums"]["scope"];
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      chronicles_relations: {
        Row: {
          ancestor: number | null;
          chronicle_id: number | null;
          created_at: string;
          id: number;
          orientation:
            | Database["public"]["Enums"]["chronicle_orientation"]
            | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          ancestor?: number | null;
          chronicle_id?: number | null;
          created_at?: string;
          id?: number;
          orientation?:
            | Database["public"]["Enums"]["chronicle_orientation"]
            | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          ancestor?: number | null;
          chronicle_id?: number | null;
          created_at?: string;
          id?: number;
          orientation?:
            | Database["public"]["Enums"]["chronicle_orientation"]
            | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chronicles_relations_ancestor_fkey";
            columns: ["ancestor"];
            isOneToOne: false;
            referencedRelation: "chronicles_relations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chronicles_relations_chronicle_id_fkey";
            columns: ["chronicle_id"];
            isOneToOne: false;
            referencedRelation: "chronicles";
            referencedColumns: ["id"];
          },
        ];
      };
      continents: {
        Row: {
          created_at: string | null;
          id: number;
          iso_code: string;
          translation_de: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          iso_code: string;
          translation_de?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          iso_code?: string;
          translation_de?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      countries: {
        Row: {
          continent: number | null;
          created_at: string | null;
          id: number;
          iso_alpha2: string;
          iso_alpha3: string;
          iso_numeric: string;
          translation_de: string | null;
          updated_at: string | null;
        };
        Insert: {
          continent?: number | null;
          created_at?: string | null;
          id?: number;
          iso_alpha2: string;
          iso_alpha3: string;
          iso_numeric: string;
          translation_de?: string | null;
          updated_at?: string | null;
        };
        Update: {
          continent?: number | null;
          created_at?: string | null;
          id?: number;
          iso_alpha2?: string;
          iso_alpha3?: string;
          iso_numeric?: string;
          translation_de?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_countries_continent_fkey";
            columns: ["continent"];
            isOneToOne: false;
            referencedRelation: "continents";
            referencedColumns: ["id"];
          },
        ];
      };
      dynamic_views: {
        Row: {
          chronicle_relation: number | null;
          created_at: string;
          name: string;
          scope: Database["public"]["Enums"]["scope"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          chronicle_relation?: number | null;
          created_at?: string;
          name: string;
          scope?: Database["public"]["Enums"]["scope"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          chronicle_relation?: number | null;
          created_at?: string;
          name?: string;
          scope?: Database["public"]["Enums"]["scope"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chronicles_relations_roots_chronicle_relation_fkey";
            columns: ["chronicle_relation"];
            isOneToOne: false;
            referencedRelation: "chronicles_relations";
            referencedColumns: ["id"];
          },
        ];
      };
      dynamic_vita_paths: {
        Row: {
          chronicle_id: number | null;
          created_at: string;
          dynamic_vita_id: number;
          id: number;
          knots: string[];
          updated_at: string;
        };
        Insert: {
          chronicle_id?: number | null;
          created_at?: string;
          dynamic_vita_id: number;
          id?: number;
          knots: string[];
          updated_at?: string;
        };
        Update: {
          chronicle_id?: number | null;
          created_at?: string;
          dynamic_vita_id?: number;
          id?: number;
          knots?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dynamic_vita_chronicle_paths_chronicle_id_fkey";
            columns: ["chronicle_id"];
            isOneToOne: false;
            referencedRelation: "chronicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dynamic_vita_paths_dynamic_vita_id_fkey";
            columns: ["dynamic_vita_id"];
            isOneToOne: false;
            referencedRelation: "dynamic_vitas";
            referencedColumns: ["id"];
          },
        ];
      };
      dynamic_vitas: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      entities: {
        Row: {
          address: number | null;
          avatar: string | null;
          brand_color: string | null;
          created_at: string;
          description: string | null;
          domain: string | null;
          id: number;
          is_custom: boolean;
          name: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          address?: number | null;
          avatar?: string | null;
          brand_color?: string | null;
          created_at?: string;
          description?: string | null;
          domain?: string | null;
          id?: number;
          is_custom?: boolean;
          name?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          address?: number | null;
          avatar?: string | null;
          brand_color?: string | null;
          created_at?: string;
          description?: string | null;
          domain?: string | null;
          id?: number;
          is_custom?: boolean;
          name?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chronicles_entity_address_fkey";
            columns: ["address"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          day_of_birth: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          marital_status: Database["public"]["Enums"]["marital_status"] | null;
        };
        Insert: {
          avatar_url?: string | null;
          day_of_birth?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          marital_status?: Database["public"]["Enums"]["marital_status"] | null;
        };
        Update: {
          avatar_url?: string | null;
          day_of_birth?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          marital_status?: Database["public"]["Enums"]["marital_status"] | null;
        };
        Relationships: [];
      };
      vitas: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          scope: Database["public"]["Enums"]["scope"] | null;
          type: Database["public"]["Enums"]["vita_type"];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          scope?: Database["public"]["Enums"]["scope"] | null;
          type: Database["public"]["Enums"]["vita_type"];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          scope?: Database["public"]["Enums"]["scope"] | null;
          type?: Database["public"]["Enums"]["vita_type"];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      vitas_shards_dynamic: {
        Row: {
          chronicle_id: number;
          created_at: string | null;
          id: number;
          next_id: number | null;
          prev_id: number | null;
          vita_id: number;
          x: number;
          y: number;
        };
        Insert: {
          chronicle_id: number;
          created_at?: string | null;
          id: number;
          next_id?: number | null;
          prev_id?: number | null;
          vita_id: number;
          x: number;
          y: number;
        };
        Update: {
          chronicle_id?: number;
          created_at?: string | null;
          id?: number;
          next_id?: number | null;
          prev_id?: number | null;
          vita_id?: number;
          x?: number;
          y?: number;
        };
        Relationships: [
          {
            foreignKeyName: "vitas_configs_dynamic_vita_id_fkey";
            columns: ["vita_id"];
            isOneToOne: false;
            referencedRelation: "vitas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vitas_fragments_dynamic_chronicle_id_fkey";
            columns: ["chronicle_id"];
            isOneToOne: false;
            referencedRelation: "chronicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vitas_shards_dynamic_next_id_fkey";
            columns: ["vita_id", "next_id"];
            isOneToOne: false;
            referencedRelation: "vitas_shards_dynamic";
            referencedColumns: ["vita_id", "id"];
          },
          {
            foreignKeyName: "vitas_shards_dynamic_prev_id_fkey";
            columns: ["vita_id", "prev_id"];
            isOneToOne: false;
            referencedRelation: "vitas_shards_dynamic";
            referencedColumns: ["vita_id", "id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_column_metadata: {
        Args: { table_name: string };
        Returns: {
          character_maximum_length: number;
          column_description: string;
          column_name: string;
          data_type: string;
          is_nullable: boolean;
          max_array_length: number;
          numeric_precision: number;
          numeric_scale: number;
          udt_info: Json;
          udt_name: string;
          udt_schema: string;
        }[];
      };
      get_enum_values: {
        Args: { enum_name: string };
        Returns: {
          label: string;
        }[];
      };
      getcv: {
        Args: { inputname: string; inputuserid: string };
        Returns: Json;
      };
      replace_vitas_shards_dynamic: {
        Args: { p_rows: Json; p_vita_id: number };
        Returns: {
          chronicle_id: number;
          created_at: string | null;
          id: number;
          next_id: number | null;
          prev_id: number | null;
          vita_id: number;
          x: number;
          y: number;
        }[];
        SetofOptions: {
          from: "*";
          to: "vitas_shards_dynamic";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
    };
    Enums: {
      chronicle_category:
        | "work experience"
        | "education"
        | "internship"
        | "volunteering"
        | "hobby";
      chronicle_orientation: "above" | "below" | "neutral";
      marital_status:
        | "single"
        | "married"
        | "divorced"
        | "widowed"
        | "separated"
        | "partnered";
      scope: "private" | "public" | "restricted";
      vita_type: "DYNAMIC" | "STATIC";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      chronicle_category: [
        "work experience",
        "education",
        "internship",
        "volunteering",
        "hobby",
      ],
      chronicle_orientation: ["above", "below", "neutral"],
      marital_status: [
        "single",
        "married",
        "divorced",
        "widowed",
        "separated",
        "partnered",
      ],
      scope: ["private", "public", "restricted"],
      vita_type: ["DYNAMIC", "STATIC"],
    },
  },
} as const;
