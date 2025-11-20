import { json } from "@sveltejs/kit";
import { getDb } from "$lib/server/mongodb";

export async function GET() {
    const db = getDb();
    const users = (await db).collection('users').find().toArray();
    return json(users)
}