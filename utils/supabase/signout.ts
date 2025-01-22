import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createClientComponentClient } from "../../utils/supabase";
import toast from "react-hot-toast";

const supabase = createClientComponentClient();

export async function signOut(router: AppRouterInstance) {
    try {
        await supabase.auth.signOut();
        toast.success("Signed out successfully");
        router.refresh();
        router.push("/"); // Redirect to home page
    } catch (error) {
        toast.error("Error signing out");
        console.error("Error signing out:", error);
    }
}
