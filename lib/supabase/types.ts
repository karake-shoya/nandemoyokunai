// このファイルは Supabase プロジェクト接続後に
// `npx supabase gen types typescript --project-id <PROJECT_ID>` で上書きすること

export type TonePreference = "polite" | "casual" | "emoji";
export type CookedBy = "self" | "partner" | "takeout" | "restaurant";
export type MenuCategory = "和食" | "洋食" | "中華" | "麺" | "丼" | "その他";

export interface Database {
  public: {
    Views: Record<string, never>;
    Enums: Record<string, never>;
    Functions: {
      get_recent_menus: {
        Args: { p_user_id: string; p_days: number };
        Returns: { menu_id: string }[];
      };
    };
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          tone_preference: TonePreference;
          exclude_days: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          tone_preference?: TonePreference;
          exclude_days?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          tone_preference?: TonePreference;
          exclude_days?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          likes: string | null;
          dislikes: string | null;
          cooking_tendency: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          likes?: string | null;
          dislikes?: string | null;
          cooking_tendency?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          likes?: string | null;
          dislikes?: string | null;
          cooking_tendency?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partners_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      menus: {
        Row: {
          id: string;
          name: string;
          category: MenuCategory;
          is_shared: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: MenuCategory;
          is_shared?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: MenuCategory;
          is_shared?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menus_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      suggestion_sessions: {
        Row: {
          id: string;
          user_id: string;
          suggested_at: string;
          generated_message: string | null;
          selected_menu_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          suggested_at: string;
          generated_message?: string | null;
          selected_menu_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          suggested_at?: string;
          generated_message?: string | null;
          selected_menu_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suggestion_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "suggestion_sessions_selected_menu_id_fkey";
            columns: ["selected_menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          }
        ];
      };
      suggestion_items: {
        Row: {
          id: string;
          session_id: string;
          menu_id: string;
          order_index: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          menu_id: string;
          order_index: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          menu_id?: string;
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "suggestion_items_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "suggestion_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "suggestion_items_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          }
        ];
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          menu_id: string;
          cooked_by: CookedBy;
          memo: string | null;
          eaten_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          menu_id: string;
          cooked_by: CookedBy;
          memo?: string | null;
          eaten_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          menu_id?: string;
          cooked_by?: CookedBy;
          memo?: string | null;
          eaten_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_logs_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
}
