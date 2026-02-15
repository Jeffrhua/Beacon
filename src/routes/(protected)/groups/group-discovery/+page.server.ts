import { getAllGroups, createGroup, getMemberCount } from "$lib/server/mongodb";
import type { Group, GroupDb } from "$lib/types.js";
import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export const load = async () => {
    // Fetch all groups and their member counts
    const groups : GroupDb[] = await getAllGroups();
    const memberCounts = await getMemberCount();

    //Map the member counts by group ID for easy lookup
    const memberCountMap = new Map<string, number>(
      memberCounts.map(mc => [mc._id.toString(), mc.count])
    );

    //Serialize ObjectIds to strings
    const serialized: Group[] = groups.map(({_id, owner_id, ...r}) =>({
        id: _id.toString(), 
        owner_id: owner_id.toString(),
        memberCount: memberCountMap.get(_id.toString()) ?? 0,
        ...r
    }))

    return {
        groups: serialized
    };
};

export const actions: Actions = {
  groupCreate: async ({ request, locals }) => {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    // Validate input
    if (!title || !description) {
      return fail(400, { message: "Title and description are required." });
    }
    // Check if user is authenticated
    const userId = locals.user?.id;
    if (!userId) {
      return fail(401, { message: "Unauthorized. Please log in." });
    }

    //Create the group and redirect to the new group page
    const newGroup = await createGroup(new ObjectId(userId), title, description);
    if (!newGroup) {
      return fail(500, { message: "Failed to create group." });
    }
    throw redirect(303, `/groups/${newGroup}`); 
  }  
};