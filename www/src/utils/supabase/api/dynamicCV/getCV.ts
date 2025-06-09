import { createClient } from "../../client";

export async function getCV(id: string) {
    const supabase = await createClient();

    const { data: chronicles, error } = await supabase
        .from('dynamic_views')
        .select('*');

    if (error) {
        console.error('Error fetching profiles:', error);
        return [];
    }

    return chronicles;
}
