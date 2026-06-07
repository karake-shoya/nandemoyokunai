import type { CookedBy, MenuCategory } from "@/lib/supabase/types";
import { COOKED_BY_LABELS } from "@/lib/types/home";

export const CATEGORY_OPTIONS: MenuCategory[] = ["和食", "洋食", "中華", "麺", "丼", "その他"];
export const COOKED_BY_OPTIONS = Object.entries(COOKED_BY_LABELS) as [CookedBy, string][];
