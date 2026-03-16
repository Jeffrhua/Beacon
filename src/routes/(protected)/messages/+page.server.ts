import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);

    return {
        userId: userId.toString()
    }
} 
