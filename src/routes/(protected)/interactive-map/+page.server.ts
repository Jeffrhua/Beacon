import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { MongoClient, ObjectId } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';
import { getUserGroups } from '$lib/server/mongodb';

const client = new MongoClient(MONGODB_URI);
const db = client.db('test');

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/sign-in');

    const userId = new ObjectId(locals.user.id);
    await client.connect();

    const groups = await getUserGroups(userId);

    const groupIds = groups.map(g => g._id.toString());
    const incidents = await db.collection('incidents').find({
        groupId: { $in: groupIds }
    }).toArray();

    return {
        incidents: incidents.map(inc => ({
            lat:         inc.lat,
            lng:         inc.lng,
            description: inc.description,
            address:     inc.address || '',
            severity:    inc.severity ?? 'low'
        })),
        groups: groups.map(g => ({
            id:    g._id.toString(),
            title: g.title
        }))
    };
};

export const actions: Actions = {
    addIncident: async ({ request, locals }) => {
        if (!locals.user) throw redirect(303, '/sign-in');

        const userId   = new ObjectId(locals.user.id);
        const formData = await request.formData();

        const lat         = parseFloat(formData.get('lat') as string);
        const lng         = parseFloat(formData.get('lng') as string);
        const description = formData.get('description') as string;
        const address     = formData.get('address') as string;
        const groupId     = formData.get('groupId') as string;
        const severity    = (formData.get('severity') as string) || 'low';

        if (!description) return fail(400, { error: 'Description is required' });

        // Convert photo to base64 if provided
        let photoData: string | null = null;
        const photo = formData.get('photo') as File | null;
        if (photo && photo.size > 0) {
            const buffer = Buffer.from(await photo.arrayBuffer());
            photoData = `data:${photo.type};base64,${buffer.toString('base64')}`;
        }

        await client.connect();

        // Fetch user's name from Beacon db
        const beaconDb    = client.db('Beacon');
        const fullUser    = await beaconDb.collection('user').findOne({ _id: userId });
        const submittedBy = fullUser?.name ?? 'Unknown';

        const now = new Date();

        // Save incident
        await db.collection('incidents').insertOne({
            groupId,
            lat,
            lng,
            description,
            address,
            severity,
            status:    'active',
            photo:     photoData,
            createdAt: now
        });

        if (groupId) {
            const mainDb   = client.db('main');
            const alertRes = await mainDb.collection('alert').insertOne({
                title:       'New Incident Reported',
                description: description,
                severity:    'medium',
                longitude:   lng,
                latitude:    lat,
                address:     address,
                user_id:     new ObjectId(userId),
                submittedBy: submittedBy
            });

            await mainDb.collection('alert_group').insertOne({
                group_id: new ObjectId(groupId),
                alert_id: alertRes.insertedId
            });
        }

        return { success: true };
    }
};