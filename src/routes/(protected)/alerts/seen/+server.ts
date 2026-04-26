import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { markAlertsAsSeen } from '$lib/server/mongodb';
import { ObjectId } from 'mongodb';

export const POST: RequestHandler = async ({ request, locals }) => {
    const { alertIds } = await request.json();
    const userId = new ObjectId(locals.user.id);
    await markAlertsAsSeen(userId, alertIds.map((id: string) => new ObjectId(id)));
    return json({ success: true });
};