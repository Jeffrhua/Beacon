import { ObjectId, Double } from 'mongodb';
import { client } from "$lib/server/auth";
import { error, redirect } from '@sveltejs/kit';
import * as mon from "$lib/server/mongodb";
import type { GroupDb, Alert, User, AlertDb } from '$lib/types';

export const ChatActions = {
    addUsersToConversation: async ({ request, locals }) => {
        const form = await request.formData();
        const userStrings = (form.get("users") as string).split(",").map(u => u.trim()).filter(Boolean);
        let userIds = new Array<ObjectId>;

        // Add user who requested group creation first
        userIds.push(new ObjectId(locals.user.id))

        // Then convert all other participants to object ids
        for (const userId of userStrings) {
            userIds.push(new ObjectId(userId));
        }

        await mon.createChatGroup(userIds);
    },
}