import { Resend } from 'resend';
import { RESEND_KEY } from '$env/static/private';
import type { Alert, GroupDb } from './types';
import { getUser } from './server/mongodb';
import { ObjectId } from 'mongodb';

let _resend: Resend | null = null;
function getResend() {
  if (!RESEND_KEY) return null;
  if (!_resend) _resend = new Resend(RESEND_KEY);
  return _resend;
}
// define a resendObject type to avoid typescript issues
type resendObject = {
  from: string,
  to: string[],
  subject: string,
  html: string,
}

export async function sendAlertEmail(emails : string[], alert: Alert, group: GroupDb){
    const sent_by = await getUser(new ObjectId(alert.user_id))
    for(let i = 0; i < emails.length; i += 100){ // we chose 100 because Resend library can only send up to 100 emails at once
      const batch = emails.slice(i, i + 100)
      // turn every email in the batch into a resendObject
      const emailsToSend : resendObject[] = batch.map((e) => ({
          from: 'Beacon <Beacon@chriskau.dev>',
          to: [e],
          subject: `ALERT: ${group.title} / ${alert.severity} severity / ${alert.title}`,
          html: 
          `
          <p><b>Description of alert:</b> ${alert.description}</p>
          <p><b>Longitude & Latitude:</b> ${alert.longitude},${alert.latitude}</p>
          <p><b>Address of Alert:</b> ${alert.address}</p>
          <p><b>Sent at:</b> ${alert.dateCreated}</p>
          <p><b>Sent by:</b> ${sent_by.name}</p>
          <p><b>Alert id:</b> ${alert.id}</p>
          `
      }))
      const resend = getResend();
      if (!resend) { console.warn('RESEND_KEY not set — skipping email send'); return; }
      await resend.batch.send(emailsToSend);
    }

}
