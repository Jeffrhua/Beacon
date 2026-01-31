import { getGroup, getGroupUsers, getUser } from '$lib/server/mongodb.js'
import { ObjectId, Double } from 'mongodb';
import { client } from "$lib/server/auth";

export const load = async ({params, locals}) => {
    const groupId = new ObjectId(params.id);
    const group = await getGroup(groupId);
    const groupUsers = await getGroupUsers(groupId);
    if(group == null){
        return {error: "Group not found"}
    }
    const ownerId = group.owner_id
    const owner = await getUser(ownerId);
    const ownerSerialized = owner
        ? {
            id: owner._id.toString(),
            name: owner.name,
            displayName: owner.displayName
        }
        : null;
    let users = [];
    groupUsers.forEach((u)=>{
        users.push({id: u._id.toString(), name: u.name, displayName: u.displayName})
    })
    const {_id, owner_id, ...r} = group;
    return {
        group: {id: _id.toString(), ...r},
        users: users,
        owner: ownerSerialized,
        currentUser: locals.user
    }
}

export const actions = {
    sendAlert: async ({ request, params, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;
        const groupId = params.id

        const title = form.get("title")?.toString().trim();
        const description = form.get("description")?.toString().trim() ?? "";
        const severity = form.get("severity")?.toString().toLowerCase().trim() ?? "";
        const longitude = Number(form.get('longitude'));
        const latitude = Number(form.get('latitude'));
        const address = form.get("address")?.toString().toLowerCase().trim() ?? "";

        // Check for valid coord values
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            return //Probs add error stuff here
        }

        const db = client.db('main')
        const alertRes = await db.collection('alert').insertOne({
            title: title,
            description: description,
            severity: severity,
            longitude: new Double(longitude),
            latitude: new Double(latitude),
            address: address,
            user_id: new ObjectId(userId)
        })

        const newAlertId = alertRes.insertedId;

        const alertGropuRes = await db.collection('alert_group').insertOne({
            group_id: new ObjectId(groupId),
            alert_id: new ObjectId(newAlertId),
        })

        return { success: true, message: 'yayyy!!!' }
    }
}