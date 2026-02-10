import { ObjectId } from "mongodb";
import { getUserGroups } from "$lib/server/mongodb";
import type { Group, GroupDb } from "$lib/types.js";
import { GroupActions } from "$lib/server/actions/GroupActions";


export const load = async ({locals}) => {
    const user = locals.user;
    if(!user){
        return{
            groupIds: []
        }
    }
    const userId = new ObjectId(user.id);
    const groups : GroupDb[] = await getUserGroups(userId);
    const serialized : Group[] = groups.map(({_id, owner_id, ...r}) =>({
        id: _id.toString(), // ObjectId is not serializable, so we convert to string
        ...r
    }))

    // IGNORE THIS I WAS TESTING STUFF
    // const users : UserDb[] = await getGroupUsers(new ObjectId("697957fa5349a0d3f5062a72"))
    // const serialized2 : User[] = users.map(({_id, ...r}) =>({
    //     id: _id.toString(),
    //     ...r
    // }))

    return {groups: serialized}
}

export const actions = GroupActions;
