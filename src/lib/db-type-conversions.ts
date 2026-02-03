import type {AlertDb, Alert } from "$lib/types"
export function alertDbToAlert(a: AlertDb): Alert {
  return {
    id: a._id.toString(),
    title: a.title,
    description: a.description,
    severity: a.severity,
    longitude: a.longitude,
    latitude: a.latitude,
    address: a.address,
    user_id: a.user_id.toString()
  };
}