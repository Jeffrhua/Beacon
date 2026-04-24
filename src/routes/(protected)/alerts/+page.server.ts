import { ObjectId } from "mongodb";
import type { PageServerLoad } from "./$types";
import {
	getAllUserAlerts,
	getGroupFromAlert,
	getEscalationRecords,
	evaluateEscalation
} from "$lib/server/mongodb";
import { formatDate } from "$lib/utils";
import { AlertActions } from "$lib/server/actions/AlertActions";

export const load: PageServerLoad = async ({ locals }) => {
	const userId = new ObjectId(locals.user.id);
	const userAlerts = await getAllUserAlerts(userId);

	// Batch-fetch all escalation records up front
	const alertIds = userAlerts.map((a) => new ObjectId(a._id));
	const escalationRecords = await getEscalationRecords(alertIds);
	const escalationMap = new Map(escalationRecords.map((r) => [r.alert_id.toString(), r]));

	// Lazily evaluate time-based escalations for any alert that's overdue
	const now = Date.now();
	const escalationPromises: Promise<void>[] = [];

	for (const alertId of alertIds) {
		const rec = escalationMap.get(alertId.toString());
		if (!rec || rec.resolved || !rec.autoEscalate) continue;

		const minutesSince = (now - new Date(rec.lastEscalatedAt).getTime()) / 60_000;
		const severityOrder = ['low', 'medium', 'high', 'critical'];
		const atMax = severityOrder.indexOf(rec.currentSeverity) >= severityOrder.length - 1;

		if (minutesSince >= rec.escalateAfterMinutes && !atMax) {
			escalationPromises.push(evaluateEscalation(alertId));
		}
	}

	if (escalationPromises.length > 0) {
		await Promise.all(escalationPromises);
		// Refresh records after escalations applied
		const updated = await getEscalationRecords(alertIds);
		updated.forEach((r) => escalationMap.set(r.alert_id.toString(), r));
	}

	const groupAlerts = await Promise.all(
		userAlerts.map(async (alert) => {
			const timestamp = new ObjectId(alert._id).getTimestamp();
			const group = await getGroupFromAlert(new ObjectId(alert._id));
			if (!group) return null;

			const esc = escalationMap.get(alert._id.toString());

			return {
				alertId: alert._id.toString(),
				alertTitle: alert.title,
				alertCreated: formatDate(timestamp),
				alertDescription: alert.description,
				alertSeverity: esc?.currentSeverity ?? alert.severity,
				date: timestamp,
				groupId: group._id.toString(),
				groupName: group.title,
				submittedBy: alert.userDetails?.name ?? "Unknown",
				submittedId: alert.user_id.toString(),
				escalation: esc
					? {
							escalationCount: esc.escalationCount ?? 0,
							baseSeverity: esc.baseSeverity,
							resolved: esc.resolved ?? false,
							ackCount: esc.acknowledgedBy?.length ?? 0,
							ackThreshold: esc.ackThreshold ?? 5,
							hasAcknowledged:
								esc.acknowledgedBy?.some(
									(id: ObjectId) => id.toString() === userId.toString()
								) ?? false,
							autoEscalate: esc.autoEscalate ?? true,
							escalateAfterMinutes: esc.escalateAfterMinutes ?? 30,
							history: (esc.history ?? []).map((h: any) => ({
								severity: h.severity,
								reason: h.reason,
								at: h.at
							}))
					  }
					: null
			};
		})
	);

	groupAlerts.sort((a, b) => {
		if (!a || !b) return 0;
		return b.date.getTime() - a.date.getTime();
	});

	return {
		userId: userId.toString(),
		userAlerts: groupAlerts.filter(Boolean)
	};
};

export const actions = AlertActions;
