import { ObjectId } from "mongodb";
import { getUserFriends, getAllUsers, addFriend, removeFriend } from "$lib/server/mongodb";
import type { PageServerLoad } from "./$types.js";
import type { Actions } from "./$types.js";

export const load : PageServerLoad = async ({locals}) => {
    const userId = new ObjectId(locals.user.id);
    const friends = (await getUserFriends(userId)).map(friend => ({
        id: friend._id.toString(),
        name: friend.name,
        email: friend.email

    }));
      const excludedUsers = [
        userId,
        ...friends.map((f) => new ObjectId(f.id))
    ];

    const all_users = (await getAllUsers(excludedUsers)).map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email
    }));
    return {friends, all_users}

}


export const actions: Actions = {
  addFriend: async ({ locals, request }) => {
    const data = await request.formData();
    const friendId = new ObjectId(data.get("friendId") as string);
    const userId = new ObjectId(locals.user.id);
    await addFriend(userId, friendId);
  },
  removeFriend: async ({locals, request}) => {
    const data = await request.formData();
    const friendId = new ObjectId(data.get("friendId") as string);
    const userId = new ObjectId(locals.user.id);
    await removeFriend(userId, friendId);
  }
};