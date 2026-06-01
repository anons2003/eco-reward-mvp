export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          avatar_object_key: string | null;
          phone: string | null;
          location: string | null;
          bio: string | null;
          role: "user" | "admin";
          status: "active" | "blocked" | "deleted";
          points: number;
          trust_score: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      bins: {
        Row: {
          id: string;
          name: string;
          qr_code: string;
          location_name: string;
          lat: number;
          lng: number;
          active: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["bins"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["bins"]["Row"]>;
      };
      scan_sessions: {
        Row: {
          id: string;
          user_id: string;
          bin_id: string;
          qr_code: string;
          lat: number | null;
          lng: number | null;
          expires_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["scan_sessions"]["Row"]> & {
          user_id: string;
          bin_id: string;
          qr_code: string;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["scan_sessions"]["Row"]>;
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          bin_id: string;
          scan_session_id: string;
          image_url: string;
          ai_result: Json;
          status: "approved" | "pending_review" | "rejected";
          points: number;
          reason: string;
          risk_flags: string[];
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["submissions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["submissions"]["Row"]>;
      };
      point_transactions: {
        Row: {
          id: string;
          user_id: string;
          submission_id: string | null;
          points: number;
          reason: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["point_transactions"]["Row"]> & {
          user_id: string;
          points: number;
          reason: string;
        };
        Update: Partial<Database["public"]["Tables"]["point_transactions"]["Row"]>;
      };
      point_rules: {
        Row: {
          waste_type:
            | "plastic_bottle"
            | "metal_can"
            | "paper"
            | "cardboard"
            | "glass_bottle"
            | "organic"
            | "hazardous"
            | "unknown";
          points: number;
          active: boolean;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["point_rules"]["Row"]> & {
          waste_type: Database["public"]["Tables"]["point_rules"]["Row"]["waste_type"];
          points: number;
        };
        Update: Partial<Database["public"]["Tables"]["point_rules"]["Row"]>;
      };
      reward_items: {
        Row: {
          id: string;
          title: string;
          description: string;
          points_required: number;
          stock: number;
          active: boolean;
          category: "Voucher" | "Quà tặng" | "Đóng góp" | "Dịch vụ";
          partner: string;
          image_url: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reward_items"]["Row"]> & {
          title: string;
          description: string;
          points_required: number;
        };
        Update: Partial<Database["public"]["Tables"]["reward_items"]["Row"]>;
      };
      reward_redemptions: {
        Row: {
          id: string;
          user_id: string;
          reward_item_id: string;
          points_spent: number;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reward_redemptions"]["Row"]> & {
          user_id: string;
          reward_item_id: string;
          points_spent: number;
        };
        Update: Partial<Database["public"]["Tables"]["reward_redemptions"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & {
          action: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      redeem_reward: {
        Args: { reward_id: string };
        Returns: {
          redemption_id: string;
          reward_item_id: string;
          points_spent: number;
          remaining_points: number;
          remaining_stock: number;
        };
      };
    };
    Enums: {
      profile_status: "active" | "blocked" | "deleted";
      submission_status: "approved" | "pending_review" | "rejected";
      user_role: "user" | "admin";
    };
    CompositeTypes: Record<string, never>;
  };
};
