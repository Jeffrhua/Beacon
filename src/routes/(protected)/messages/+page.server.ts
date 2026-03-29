import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";
import { ChatActions } from "$lib/server/actions/chatActions.js";
import { getAllChatGroups, getAllMsgs, getUserFriends } from "$lib/server/mongodb.js";
import type { User, GroupChat } from "$lib/types.js";

export const load: PageServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);
    const groupChatsData = await getAllChatGroups(userId);
    const friends = (await getUserFriends(userId)).map(friend => ({
            id: friend._id.toString(),
            name: friend.name,
            email: friend.email

        }));
    // Map data to a readable format (Just the id objects)
    const groupChats = groupChatsData.map((chat: any): GroupChat => ({
        id: chat._id.toString(),
        participants: chat.participants.map((id: any) => id.toString()),
        userDetails: (chat.userDetails ?? []).map((user: any): User => ({
            id: user._id?.toString?.() ?? user._id,
            name: user.name,
            email: user.email
        }))
    }));

    return {
        userId: userId.toString(),
        groupChats: groupChats,
        friends
    }
} 

export const actions = ChatActions;