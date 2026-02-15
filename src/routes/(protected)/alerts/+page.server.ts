import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";
import { getAllUserAlerts, getGroupFromAlert } from "$lib/server/mongodb";
import { formatDate } from "$lib/utils";
import type { Alert } from "$lib/types";

export const load: PageServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);
    const userAlerts : Alert[] = await getAllUserAlerts(userId);
    // put all the user's alert into a readable object
    const groupAlerts = await Promise.all(
        userAlerts.map(async (alert) => {
            const group = await getGroupFromAlert(new ObjectId(alert.id));
            if(!group) return;
            return {
            alertTitle: alert.title,
            alertCreated: formatDate(alert.dateCreated),
            alertDescription: alert.description,
            alertSeverity: alert.severity,
            date: alert.dateCreated,
            groupId: group._id.toString(),
            groupName: group.title
        }
        })
      );
    // sort the alerts by most recent
    groupAlerts.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
        userAlerts: groupAlerts
    }
} 
