import type { CookedBy, MenuCategory } from "@/lib/supabase/types";

export type MealLogWithMenu = {
  id: string;
  eaten_at: string;
  cooked_by: CookedBy;
  memo: string | null;
  menus: { name: string; category: MenuCategory } | null;
  suggestion_sessions: {
    menus: { name: string } | null;
  } | null;
};

export type MealLogForHistory = {
  id: string;
  eaten_at: string;
  cooked_by: CookedBy;
  memo: string | null;
  menus: { name: string; category: MenuCategory } | null;
};

export const COOKED_BY_LABELS: Record<CookedBy, string> = {
  self: "自分が作った",
  partner: "パートナーが作った",
  takeout: "テイクアウト",
  restaurant: "外食",
};
