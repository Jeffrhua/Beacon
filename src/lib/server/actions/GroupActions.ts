import { ObjectId, Double } from 'mongodb';
import { client } from "$lib/server/auth";
import { error, redirect } from '@sveltejs/kit';
import { addGroupMember, removeGroupMember, createGroup, deleteGroup, updateGroup, checkGroupRole, updateGroupMemberRole, transferGroupOwnership, getUsersFromGroup, getGroup, getAlert } from "$lib/server/mongodb";
import type { GroupDb, Alert, User, AlertDb } from '$lib/types';
import { sendAlertEmail } from '$lib/resend';
import { alertDbToAlert } from '$lib/db-type-conversions';

export const GroupActions = {
    sendAlert: async ({ request, params, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;
        const groupId = params.id

        const userRole = await checkGroupRole(new ObjectId(userId), new ObjectId(groupId));
        const allowedRoles = ["admin", "owner", "moderator"];
        if (!userRole || !allowedRoles.includes(userRole)) {
            return { error: "No permission to send alert" };
        }

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

        // Send email to all users of this group
        const users = await getUsersFromGroup(new ObjectId(groupId));
        const user_emails: string[] =  users.map((u) => u.email); // we only need the user_email
        const group : GroupDb | null = await getGroup(new ObjectId(groupId));
        const alertDb_object : AlertDb | null = await getAlert(new ObjectId(newAlertId))
        if(alertDb_object !== null && group !== null){
            const alert : Alert = alertDbToAlert(alertDb_object)
            if(alert !== null)
                await sendAlertEmail(user_emails, alert, group)
        }
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
    },
    saveGroupSettings: async ({ request }) => {
        const form = await request.formData();

        const updatedGroup : GroupDb = {
            _id: new ObjectId(form.get("group_id")),
            title: form.get("group_title"),
            description: form.get("group_description"),
            owner_id: new ObjectId(form.get("owner_id"))
        }
        await updateGroup(updatedGroup)
    },

    removeUser: async ({ params, request}) => {
        const form = await request.formData();
        const userId = form.get("userId") as string;

        if (userId) {
            await removeGroupMember(new ObjectId(userId), new ObjectId(params.id))
        }
    },

    promoteUser: async ({ params, request, locals }) => {
        const form = await request.formData();
        const targetUserId = form.get("userId") as string;
        const currentRole = form.get("currentRole") as string;

        const promoteTo = {
            member: "moderator",
            moderator: "admin"
        }
        
        const promoterRole = await checkGroupRole(new ObjectId(locals.user.id), new ObjectId(params.id));
        if (promoterRole === "owner" && currentRole === "admin") {
            await transferGroupOwnership(new ObjectId(locals.user.id), new ObjectId(targetUserId), new ObjectId(params.id));
            return { success: true, message: "Ownership transferred" };
        }

        if (promoterRole === "owner" && (currentRole === "member" || currentRole === "moderator")) {
            await updateGroupMemberRole(new ObjectId(targetUserId), new ObjectId(params.id), promoteTo[currentRole])
            return { success: true, message: "User promoted" };
        }

        if (promoterRole === "admin" && currentRole === "member") {
            await updateGroupMemberRole(new ObjectId(targetUserId), new ObjectId(params.id), promoteTo[currentRole])
            return { success: true, message: "User promoted" };
        }

        return { error: "No permission to promote user" };

    },

    demoteUser: async ({ params, request, locals }) => {
        const form = await request.formData();
        const targetUserId = form.get("userId") as string;
        const currentRole = form.get("currentRole") as string;

        const demoteTo = {
            admin: "moderator",
            moderator: "member"
        }

        const demoterRole = await checkGroupRole(new ObjectId(locals.user.id), new ObjectId(params.id));

        //Only owner can demote an admin and only owner and admin can demote a moderator
        if (demoterRole === "owner" && (currentRole === "admin" || currentRole === "moderator")) {
            await updateGroupMemberRole(new ObjectId(targetUserId), new ObjectId(params.id), demoteTo[currentRole])
            return { success: true, message: "User demoted" };
        }

        if (demoterRole === "admin" && currentRole === "moderator") {
            await updateGroupMemberRole(new ObjectId(targetUserId), new ObjectId(params.id), demoteTo[currentRole])
            return { success: true, message: "User demoted" };
        }

        return { error: "No permission to demote user" };
    },
}