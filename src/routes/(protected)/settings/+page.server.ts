import { client, auth } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export async function load({ locals }) {
    const db = client.db('main');
    const sessionUser = locals.user;

    const [user, sessions] = await Promise.all([
        db.collection("user").findOne({ _id: new ObjectId(sessionUser.id) }),
        db.collection("session")
            .find({ userId: new ObjectId(sessionUser.id) })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray()
    ]);

    console.log("sessions found:", sessions.length);
    console.log("looking for userId:", sessionUser.id);

    const loginActivity = sessions.map(s => ({
        id: s._id.toString(),
        createdAt: s.createdAt?.toISOString() ?? null,
        ipAddress: s.ipAddress ?? "Unknown",
        userAgent: s.userAgent ?? "Unknown"
    }));

    return {
        user: JSON.parse(JSON.stringify(user)),
        loginActivity
    };
}

export const actions = {
    updateProfile: async ({ request, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;

        const emergencyContactName = form.get('emergency_contact_name')?.toString().trim() ?? "";
        const emergencyContactPhone = form.get('emergency_contact_phone')?.toString().trim() ?? "";
        const displayName = form.get('display_name')?.toString().trim();
        const profileDescription = form.get("profile_description")?.toString().trim() ?? "";
        const phoneNumber = form.get("phone_number")?.toString().trim() ?? "";
        const status = form.get("status")?.toString().trim() ?? "";
        if (status.length > 50) {
            return fail(400, { success: false, message: "Status must be 50 characters or less." });
        }
        const db = client.db('main');
        await db.collection('user').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    displayName: displayName,
                    profileDescription: profileDescription,
                    phoneNumber: phoneNumber,
                    emergencyContactName: emergencyContactName,
                    emergencyContactPhone: emergencyContactPhone,
                    status: status
                }
            },
            { upsert: true }
        );

        return { success: true, message: 'yayyy!!!' };
    },

    deleteAccount: async ({ request, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;

        const db = client.db('main')
        
        await db.collection("user").deleteOne({ _id: new ObjectId(userId) });
        await db.collection("user_settings").deleteMany({ userId });
        
        return { success: true, message: 'yayyy!!!' }
    },

    updatePrivacy: async ({ request, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;

        const locationSharing = form.get('location_sharing') === 'on';
        const anonymousAlerts = form.get('anonymous_alerts') === 'on'; 
        
        const db = client.db('main')
        await db.collection('user').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    locationSharing: locationSharing,
                    anonymousAlerts: anonymousAlerts
                }
            },
            { upsert: true }
        )
        return { success: true, message: 'true' }
    },

    updateProfilePicture: async ({ request, locals }) => {
        const form = await request.formData();
        const user = locals.user;
        const userId = user.id;

        const photo = form.get('profile_picture') as File;

        if (!photo || photo.size === 0) return { success: false };
        if (photo.size > 2 * 1024 * 1024) return fail(400, { message: 'Image must be under 2MB' });

        const arrayBuffer = await photo.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:${photo.type};base64,${base64}`;

        const db = client.db('main');
        await db.collection('user').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { profilePicture: dataUrl } },
            { upsert: true }
        );

        return { success: true };
    }
}