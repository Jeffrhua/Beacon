import { getAllGroups, createGroup } from "$lib/server/mongodb";
import type { Group, GroupDb } from "$lib/types.js";
import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const length = randomInt(50, 100);

const testGroupsDb = Array.from({ length }, (_, i) => ({
  _id: new ObjectId(),
  title: `Test Group ${i + 1}`,
  description: `Test description for group ${i + 1}`,
  owner_id: new ObjectId()
}));

export const load = async () => {
    const groups : GroupDb[] = await getAllGroups();
    //const groups = testGroupsDb; // For testing purposes only
    const serialized: Group[] = groups.map(({_id, owner_id, ...r}) =>({
        id: _id.toString(), 
        owner_id: owner_id.toString(),
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

    if (!title || !description) {
      return fail(400, { message: "Title and description are required." });
    }
    const userId = locals.user?.id;
    if (!userId) {
      return fail(401, { message: "Unauthorized. Please log in." });
    }

    const newGroup = await createGroup(new ObjectId(userId), title, description);
    if (!newGroup) {
      return fail(500, { message: "Failed to create group." });
    }
    throw redirect(303, `/groups/${newGroup}`); 
  }  
};