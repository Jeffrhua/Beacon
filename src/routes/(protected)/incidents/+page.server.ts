import { ObjectId } from "mongodb";
import { client } from "$lib/server/auth";
import { getUserGroups } from "$lib/server/mongodb";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/sign-in');

    const userId = new ObjectId(locals.user.id);
    const db = client.db('test');
    const beaconDb = client.db('Beacon');

    // Get user's email
    const fullUser = await beaconDb.collection('user').findOne({ _id: userId });
    const email = fullUser?.email;

    // Get user's groups
    const groups = await getUserGroups(userId);
    const groupIds = groups.map(g => g._id.toString());
    const ownedGroupIds = groups
        .filter(g => g.owner_id.toString() === locals.user.id)
        .map(g => g._id.toString());

    // Fetch incidents that match EITHER email (old) OR groupId (new)
    const incidents = await db.collection('incidents').find({
        $or: [
            { email: email },
            { groupId: { $in: groupIds } }
        ]
    })
    .sort({ createdAt: -1 })
    .toArray();

    const serialized = incidents.map(({ _id, ...r }) => ({
    id: _id.toString(),
    ...r,
    createdAt: r.createdAt?.toISOString() ?? null,
    groupName: groups.find(g => g._id.toString() === r.groupId)?.title ?? "No Group",
    isAdminControlled: r.groupId
        ? ownedGroupIds.includes(r.groupId)
        : email === r.email
}));

    return { incidents: serialized };
};

export const actions = {
    updateStatus: async ({ request, locals }) => {
        if (!locals.user) return { success: false };

        const userId = new ObjectId(locals.user.id);
        const beaconDb = client.db('Beacon');
        const fullUser = await beaconDb.collection('user').findOne({ _id: userId });
        const email = fullUser?.email;

        const groups = await getUserGroups(userId);
        const ownedGroupIds = groups
            .filter(g => g.owner_id.toString() === locals.user.id)
            .map(g => g._id.toString());

        const data = await request.formData();
        const id = data.get('id')?.toString();
        const status = data.get('status')?.toString();
        if (!id || !status) return { success: false };

        const db = client.db('test');
        const incident = await db.collection('incidents').findOne({
            _id: new ObjectId(id)
        });
        if (!incident) return { success: false };

        // Allow if user owns the group OR it's their own old incident
        const isGroupAdmin = incident.groupId && ownedGroupIds.includes(incident.groupId);
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