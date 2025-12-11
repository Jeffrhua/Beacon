import { client, auth } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";

export async function load() {
    const db = client.db('Beacon');
    const settings = db.collection('user_settings')
}

export const actions = {
    default: async ({ request, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;

        const value = form.get('setting_value')?.toString().trim();

        if (!value) {
            return fail(400, { message: 'All fields are required!!' });
        }
        const db = client.db('Beacon')
        const res = await db.collection('user_settings').updateOne(
            { userId },
            {
                $set: {
                    value: value
                }
            },
            { upsert: true }
        )
        return { success: true, message: 'yayyy!!!' }
    }
}