import { ObjectId, Double } from 'mongodb';
import { client } from "$lib/server/auth";
import { error, redirect } from '@sveltejs/kit';
import * as mon from "$lib/server/mongodb";
import type { GroupDb, Alert, User, AlertDb } from '$lib/types';

export const AlertActions = {
    saveAlertSeverities: async ({ request }) => {
        const form = await request.formData();

        let alerts = JSON.parse(form.get("changedAlerts"));

        await mon.updateAlertSeverity(alerts);
    },
}