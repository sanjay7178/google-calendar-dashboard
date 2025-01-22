import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createClientComponentClient } from "../../utils/supabase";
const supabase = createClientComponentClient();

export async function signOut(router: AppRouterInstance) {
  await supabase.auth.signOut();
  router.refresh();
}
