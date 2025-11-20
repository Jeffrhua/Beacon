import { getDb } from "$lib/server/mongodb";
import { fail } from "@sveltejs/kit";

export async function load() {
    const db = await getDb();
    const users = await db.collection('users')
        .find({}, { projection: {_id: 0, firstname: 1, lastname: 1, email: 1 } })
        .sort({ firstname: 1 })
        .toArray();
    return { users };
}

export const actions = {
    default: async ({ request }) => {
        const form = await request.formData();
        const fname = form.get('firstname')?.toString().trim();
        const lname = form.get('lastname')?.toString().trim();
        const email = form.get('email')?.toString().trim();

        if (!fname || !lname || !email) {
            return fail(400, { message: 'All fields are required!!' });
        }
        const db = await getDb();
        const res = await db.collection('users').insertOne({
            firstname:fname,
            lastname: lname,
            email: email,
            createdAt: new Date()
        })
        return { success: true, message: 'yayyy!!!' }
    }
}