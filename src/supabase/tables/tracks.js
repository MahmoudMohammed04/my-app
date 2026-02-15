import { supabase } from "../supabase";


export async function getTracks()
{
    const { data, error } = await supabase
    .from("tracks")
    .select("*");

    if (error) {
        console.error(error);
        return [];
    }
    return data;
}

export const TracksTable = {
    getTracks
};