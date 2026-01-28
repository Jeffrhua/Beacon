import { getGroup } from '$lib/server/mongodb.js'
import type { GroupDb } from '$lib/types.js';
import { ObjectId } from 'mongodb';
export const load = async ({params}) => {
    const groupId = new ObjectId(params.id);
    const group = await getGroup(groupId);
    if(group == null){
        return {error: "Group not found"}
    }

    const {_id, ...r} = group;


    return {group: {id: _id.toString(), ...r}}
}
