import { getAllGroups } from "$lib/server/mongodb";
import type { Group, GroupDb } from "$lib/types.js";

export const load = async () => {
    const groups : GroupDb[] = await getAllGroups();

    const serialized: Group[] = groups.map(({_id, owner_id, ...r}) =>({
        id: _id.toString(), 
        owner_: owner_id.toString(),
        ...r
    }))


    return {
        groups: serialized
    };
};