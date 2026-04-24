import { ObjectId } from 'mongodb';
import * as mon from "$lib/server/mongodb";

export const AlertActions = {
    saveAlertSeverities: async ({ request }) => {
        const form = await request.formData();
        const alerts = JSON.parse(form.get("changedAlerts") as string);
        await mon.updateAlertSeverity(alerts);
    },

    acknowledgeAlert: async ({ request, locals }) => {
        const form = await request.formData();
        const alertId = new ObjectId(form.get("alertId") as string);
        const userId = new ObjectId(locals.user.id);
        await mon.acknowledgeAlertEscalation(alertId, userId);
    },

    resolveAlert: async ({ request, locals }) => {
        const form = await request.formData();
        const alertId = new ObjectId(form.get("alertId") as string);
        const userId = new ObjectId(locals.user.id);
        await mon.resolveAlertEscalation(alertId, userId);
    },
}