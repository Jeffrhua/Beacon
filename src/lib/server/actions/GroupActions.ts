import { ObjectId, Double } from 'mongodb';
import { client } from "$lib/server/auth";
import { redirect } from '@sveltejs/kit';
import { addGroupMember, removeGroupMember, createGroup, deleteGroup } from "$lib/server/mongodb";

export const GroupActions = {
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
    },
    joinGroup: async ({ params, locals }) => {
        await addGroupMember(new ObjectId(locals.user.id), new ObjectId(params.id), "member")
    },
    leaveGroup: async ({ params, locals }) => {
        await removeGroupMember(new ObjectId(locals.user.id), new ObjectId(params.id))
    },
    groupCreate: async ({ request, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;

        const title = form.get("title")?.toString().trim();
        const description = form.get("description")?.toString().trim() ?? "";  
        
        const groupId = await createGroup(new ObjectId(userId), title, description)

        if (groupId){
            throw redirect(303, `/groups/${groupId}`);
        }
    },
    groupDelete: async ({ params, request, locals}) => {
        const form = await request.formData();
        
        if (form.get("res") == "success"){
            await deleteGroup(new ObjectId(locals.user.id), new ObjectId(params.id))
            throw redirect(303, '/groups');
        }
    }
}