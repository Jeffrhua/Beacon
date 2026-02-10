import type { PageServerLoad, Actions } from './$types';
import { auth } from '$lib/server/auth';
import { redirect, fail } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

const client = new MongoClient(MONGODB_URI);
const db = client.db();

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/sign-in');

	const email = locals.user.email;
	if (!email) throw new Error('locals.user.email is missing');

	await client.connect();

	// Get all incidents for this user
	const incidents = await db.collection('incidents').find({ email }).toArray();

	return {
		incidents: incidents.map(inc => ({
			lat: inc.lat,
			lng: inc.lng,
			description: inc.description,
			address: inc.address || ''
		}))
	};
};

export const actions: Actions = {
	addIncident: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/sign-in');

		const email = locals.user.email;
		if (!email) throw new Error('locals.user.email is missing');

		const formData = await request.formData();
		const lat = parseFloat(formData.get('lat') as string);
		const lng = parseFloat(formData.get('lng') as string);
		const description = formData.get('description') as string;
		const address = formData.get('address') as string;

		if (!description) {
			return fail(400, { error: 'Description is required' });
		}

		await client.connect();

		await db.collection('incidents').insertOne({
			email,
			lat,
			lng,
			description,
			address,
			createdAt: new Date()
		});

		return { success: true };
	}
};