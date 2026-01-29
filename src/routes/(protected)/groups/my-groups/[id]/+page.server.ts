import { getGroup, getGroupUsers, getUser } from '$lib/server/mongodb.js'
import type { GroupDb } from '$lib/types.js';
import { ObjectId } from 'mongodb';
export const load = async ({params}) => {
    const groupId = new ObjectId(params.id);
    const group = await getGroup(groupId);
    const groupUsers = await getGroupUsers(groupId);
    if(group == null){
        return {error: "Group not found"}
    }
    const ownerId = group.owner_id
    const owner = await getUser(ownerId);
    const ownerSerialized = owner
        ? {
            id: owner._id.toString(),
            name: owner.name,
            displayName: owner.displayName
        }
        : null;
    let users = [];
    groupUsers.forEach((u)=>{
        users.push({id: u._id.toString(), name: u.name, displayName: u.displayName})
    })
    const {_id, owner_id, ...r} = group;
    return {
        group: {id: _id.toString(), ...r},
        users: users,
        owner: ownerSerialized
    }
}
