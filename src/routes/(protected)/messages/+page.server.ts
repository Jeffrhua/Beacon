import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";
import { ChatActions } from "$lib/server/actions/chatActions.js";
import { getAllChatGroups } from "$lib/server/mongodb.js";

export const load: PageServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);
    const groupChats = await getAllChatGroups(userId);

    return {
        userId: userId.toString(),
        groupChats: groupChats
    }
} 

export const actions = ChatActions;