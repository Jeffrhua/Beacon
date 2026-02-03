import { ObjectId } from "mongodb";
import type { LayoutServerLoad } from "./$types";
import { getAllUserAlerts } from "$lib/server/mongodb";
import type { Alert } from "$lib/types";

export const load: LayoutServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);
    const userAlerts:Alert[] = await getAllUserAlerts(userId);
    return {
        userAlerts: userAlerts
    }
} 
