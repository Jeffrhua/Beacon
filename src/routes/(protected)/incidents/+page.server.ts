import { ObjectId } from "mongodb";
import { client } from "$lib/server/auth";
import { getUserGroups } from "$lib/server/mongodb";
import { redirect } from "@sveltejs/kit";


export const load = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/sign-in');


    const userId   = new ObjectId(locals.user.id);
    const db       = client.db('test');
    const beaconDb = client.db('Beacon');


    const fullUser = await beaconDb.collection('user').findOne({ _id: userId });
    const email    = fullUser?.email;


    const groups        = await getUserGroups(userId);
    const groupIds      = groups.map(g => g._id.toString());
    const ownedGroupIds = groups
        .filter(g => g.owner_id.toString() === locals.user.id)
        .map(g => g._id.toString());


    const incidents = await db.collection('incidents').find({
        groupId: { $in: groupIds }
    })
    .sort({ createdAt: -1 })
    .toArray();


    const serialized = incidents.map(({ _id, ...r }) => ({
        id:               _id.toString(),
        lat:              r.lat,
        lng:              r.lng,
        description:      r.description ?? '',
        address:          r.address ?? '',
        severity:         r.severity ?? 'low',
        status:           r.status ?? 'active',
        photo:            r.photo ?? null,
        createdAt:        r.createdAt?.toISOString() ?? null,
        groupId:          r.groupId ?? null,
        groupName:        groups.find(g => g._id.toString() === r.groupId)?.title ?? "No Group",
        isAdminControlled: r.groupId
            ? ownedGroupIds.includes(r.groupId)
            : false
    }));


    return { incidents: serialized };
};


export const actions = {
    updateStatus: async ({ request, locals }) => {
        if (!locals.user) return { success: false };


        const userId   = new ObjectId(locals.user.id);
        const beaconDb = client.db('Beacon');
        const fullUser = await beaconDb.collection('user').findOne({ _id: userId });
        const email    = fullUser?.email;


        const groups        = await getUserGroups(userId);
        const ownedGroupIds = groups
            .filter(g => g.owner_id.toString() === locals.user.id)
            .map(g => g._id.toString());


        const data   = await request.formData();
        const id     = data.get('id')?.toString();
        const status = data.get('status')?.toString();
        if (!id || !status) return { success: false };


        const db       = client.db('test');
        const incident = await db.collection('incidents').findOne({ _id: new ObjectId(id) });
        if (!incident) return { success: false };


        const isGroupAdmin  = incident.groupId && ownedGroupIds.includes(incident.groupId);
        const isOwnIncident = !incident.groupId && incident.email === email;


        if (!isGroupAdmin && !isOwnIncident) {
            return { success: false, error: 'Not authorized' };
        }


        await db.collection('incidents').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );


        return { success: true };
    }
};








