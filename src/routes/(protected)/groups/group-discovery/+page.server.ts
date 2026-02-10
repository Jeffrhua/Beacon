import { getAllGroups } from "$lib/server/mongodb";
import type { Group, GroupDb } from "$lib/types.js";
import { test } from "vitest";
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
    //const groups : GroupDb[] = await getAllGroups();
    const groups = testGroupsDb; // For testing purposes only
    const serialized: Group[] = groups.map(({_id, owner_id, ...r}) =>({
        id: _id.toString(), 
        owner_: owner_id.toString(),
        ...r
    }))



    return {
        groups: serialized
    };
};