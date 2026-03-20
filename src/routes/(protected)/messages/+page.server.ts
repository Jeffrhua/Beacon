import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";
import { GroupActions } from "$lib/server/actions/GroupActions";

export const load: PageServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);

    return {
        userId: userId.toString()
    }
} 

export const actions = GroupActions;