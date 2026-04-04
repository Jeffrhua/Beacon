import { redirect } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { getAllUserAlerts } from "$lib/server/mongodb";
import { auth } from "$lib/server/auth";

export async function load({ request }) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) redirect(302, "/sign-in");

    const userId = new ObjectId(session.user.id);

    const alerts = await getAllUserAlerts(userId);

    const recentAlerts = alerts
        .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
        .slice(0, 5)
        .map(a => ({
            id: a.id,
            title: a.title,
            severity: a.severity,
            dateCreated: a.dateCreated?.toISOString() ?? null,
            submittedBy: a.submittedBy ?? "Unknown"
        }));

    return {
        recentAlerts,
        user: session.user
    };
}