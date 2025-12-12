import { client, auth } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export async function load( {locals} ) {
    const db = client.db('Beacon');
    const settings = db.collection('user_settings');
    const sessionUser = locals.user;

    const user = await db.collection("user").findOne({
        _id: new ObjectId(sessionUser.id)
    });

    return {
        user: JSON.parse(JSON.stringify(user)),
    };
}

export const actions = {
    default: async ({ request, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;

        const displayName = form.get('display_name')?.toString().trim();
        const profileDescription = form.get("profile_description")?.toString().trim() ?? "";

        const db = client.db('Beacon')
        const res = await db.collection('user').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    displayName: displayName,
                    profileDescription: profileDescription
                }
            },
            { upsert: true }
        )
        return { success: true, message: 'yayyy!!!' }
    }
}