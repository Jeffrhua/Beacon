import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

const client = new MongoClient(MONGODB_URI);
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(303, '/sign-in');

  const email = locals.user.email;
  if (!email) throw new Error('locals.user.email is missing');

await client.connect();
const db = client.db();

  const user = await db.collection('users').findOne(
    { email },
    { projection: { firstName: 1, lastName: 1, phone: 1 } }
  );

  return {
    profile: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? ''
    }
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/sign-in');

    const email = locals.user.email;
    if (!email) throw new Error('locals.user.email is missing');

    const formData = await request.formData();
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();

    const errors: Record<string, string> = {};
    if (!firstName) errors.firstName = 'First name is required';
    if (!lastName) errors.lastName = 'Last name is required';
    if (!phone) errors.phone = 'Phone is required';

    if (Object.keys(errors).length) {
      return fail(400, { success: false, errors, values: { firstName, lastName, phone } });
    }

await client.connect();
const db = client.db();

    await db.collection('users').updateOne(
      { email },
      { $set: { firstName, lastName, phone } },
      { upsert: true }
    );

    return { success: true, values: { firstName, lastName, phone } };
  }
};
