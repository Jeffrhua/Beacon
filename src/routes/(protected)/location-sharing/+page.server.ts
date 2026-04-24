import { ObjectId } from 'mongodb';
import type { PageServerLoad, Actions } from './$types';
import {
	getUserFriends,
	getLocationShare,
	upsertLocationShare,
	stopLocationShare,
	getFriendsSharedLocations
} from '$lib/server/mongodb';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = new ObjectId(locals.user.id);

	const friends = (await getUserFriends(userId)).map((f) => ({
		id: f!._id.toString(),
		name: (f as any).name,
		email: (f as any).email
	}));

	const myShare = await getLocationShare(userId);
	const sharingWith: string[] = myShare?.sharingWith?.map((id: ObjectId) => id.toString()) ?? [];
	const isActive: boolean = myShare?.isActive ?? false;

	const friendLocations = (await getFriendsSharedLocations(userId)).map((loc: any) => ({
		id: loc.id,
		name: loc.name,
		latitude: loc.latitude,
		longitude: loc.longitude,
		accuracy: loc.accuracy,
		updatedAt: loc.updatedAt
	}));

	return {
		userId: locals.user.id,
		friends,
		sharingWith,
		isActive,
		friendLocations
	};
};

export const actions: Actions = {
	startSharing: async ({ locals, request }) => {
		const data = await request.formData();
		const userId = new ObjectId(locals.user.id);
		const sharingWithRaw = data.getAll('sharingWith') as string[];
		const sharingWith = sharingWithRaw.map((id) => new ObjectId(id));

		await upsertLocationShare(userId, {
			latitude: 0,
			longitude: 0,
			accuracy: 0,
			sharingWith,
			isActive: true
		});
	},

	stopSharing: async ({ locals }) => {
		const userId = new ObjectId(locals.user.id);
		await stopLocationShare(userId);
	},

	updateTargets: async ({ locals, request }) => {
		const data = await request.formData();
		const userId = new ObjectId(locals.user.id);
		const sharingWithRaw = data.getAll('sharingWith') as string[];
		const sharingWith = sharingWithRaw.map((id) => new ObjectId(id));

		const myShare = await getLocationShare(userId);
		await upsertLocationShare(userId, {
			latitude: myShare?.latitude ?? 0,
			longitude: myShare?.longitude ?? 0,
			accuracy: myShare?.accuracy ?? 0,
			sharingWith,
			isActive: myShare?.isActive ?? false
		});
	}
};
