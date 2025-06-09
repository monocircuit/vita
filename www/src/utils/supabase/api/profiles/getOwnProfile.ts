import { createClient } from "../../client";

export async function getOwnProfile() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError) {
        console.error('Error fetching user:', userError);
        return null;
    }

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id);

    if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
    }

    return profiles;
}
