import { ObjectId } from "mongodb";
import type { LayoutServerLoad } from "./$types";
import { getAllUserAlerts, getGroupFromAlert } from "$lib/server/mongodb";
import { formatDate } from "$lib/utils";
import type { Alert } from "$lib/types";

export const load: LayoutServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);
    const userAlerts : Alert[] = await getAllUserAlerts(userId);
    const groupAlerts = await Promise.all(
        userAlerts.map(async (alert) => {
            const group = await getGroupFromAlert(new ObjectId(alert._id));
            if(!group) return;
            return {
            alertTitle: alert.title,
            alertCreated: formatDate(new ObjectId(alert._id).getTimestamp()),
            alertSeverity: alert.severity,
            date: new ObjectId(alert._id).getTimestamp(),
            groupId: group._id.toString(),
            groupName: group.title
        }
        })
      );

    groupAlerts.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
        userAlerts: groupAlerts
    }
} 
