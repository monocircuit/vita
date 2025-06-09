import { createClient } from "../../client";

export async function getAllProfiles() {
    const supabase = await createClient();

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching profiles:', error);
        return [];
    }

    return profiles;
}
