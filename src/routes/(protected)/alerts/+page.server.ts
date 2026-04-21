import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";
import { getAllUserAlerts, getGroupFromAlert } from "$lib/server/mongodb";
import { formatDate } from "$lib/utils";
import type { Alert } from "$lib/types";

export const load: PageServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);
    const userAlerts = await getAllUserAlerts(userId);
    // put all the user's alert into a readable object
    const groupAlerts = await Promise.all(
        userAlerts.map(async (alert) => {
            const timestamp = new ObjectId(alert._id).getTimestamp();
            const group = await getGroupFromAlert(new ObjectId(alert._id));
            if(!group) return;
            return {
            alertTitle: alert.title,
            alertCreated: formatDate(timestamp),
            alertDescription: alert.description,
            alertSeverity: alert.severity,
            date: timestamp,
            groupId: group._id.toString(),
            groupName: group.title,
            submittedBy: alert.userDetails.name ?? "Unknown",
            submittedId: alert.user_id.toString()
        }
        })
      );
    // sort the alerts by most recent
    groupAlerts.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
        userId: userId.toString(),
        userAlerts: groupAlerts
    }
} 
