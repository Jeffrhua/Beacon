import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { MongoClient, ObjectId, Double } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';
import { getUserGroups } from '$lib/server/mongodb';

const client = new MongoClient(MONGODB_URI);
const db = client.db('test');

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/sign-in');

    const userId = new ObjectId(locals.user.id);
    await client.connect();

    // Get user's groups
    const groups = await getUserGroups(userId);

    // Get all incidents for this user's groups
    const groupIds = groups.map(g => g._id.toString());
    const incidents = await db.collection('incidents').find({
        groupId: { $in: groupIds }
    }).toArray();

    return {
        incidents: incidents.map(inc => ({
            lat: inc.lat,
            lng: inc.lng,
            description: inc.description,
            address: inc.address || ''
        })),
        groups: groups.map(g => ({
            id: g._id.toString(),
            title: g.title
        }))
    };
};

export const actions: Actions = {
    addIncident: async ({ request, locals }) => {
        if (!locals.user) throw redirect(303, '/sign-in');

        const userId = new ObjectId(locals.user.id);
        const formData = await request.formData();

        const lat = parseFloat(formData.get('lat') as string);
        const lng = parseFloat(formData.get('lng') as string);
        const description = formData.get('description') as string;
        const address = formData.get('address') as string;
        const groupId = formData.get('groupId') as string;

        if (!description) return fail(400, { error: 'Description is required' });
        if (!groupId) return fail(400, { error: 'Please select a group' });

        await client.connect();

        // 1. Save the incident (same as before)
        await db.collection('incidents').insertOne({
            groupId,
            lat,
            lng,
            description,
            address,
            createdAt: new Date()
        });

        // 2. NEW: Create alert so it shows in bell notification
        const mainDb = client.db('main');
        const alertRes = await mainDb.collection('alert').insertOne({
			title: 'New Incident Reported',
			description: description,
			severity: 'medium',
			longitude: lng,        // plain number, no Double()
			latitude: lat,         // plain number, no Double()
			address: address,
			user_id: new ObjectId(userId)  // no dateCreated!
		});

        // 3. NEW: Link alert to group so all members see it in their bell
        await mainDb.collection('alert_group').insertOne({
            group_id: new ObjectId(groupId),
            alert_id: alertRes.insertedId
        });

        return { success: true };
    }
};