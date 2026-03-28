import { json } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getAllMsgs } from '$lib/server/mongodb';

export async function GET({ params, locals }) {
    const conversationId = new ObjectId(params.conversation_id);

    const msgs = await getAllMsgs(conversationId);

    return json(
        msgs.map((m: any) => ({
            id: m._id.toString(),
            conversation_id: m.conversation_id.toString(),
            sender_id: m.sender_id.toString(),
            content: m.content,
            createdAt: m.createdAt
        }))
    );
}