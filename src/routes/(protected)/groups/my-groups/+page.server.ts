import { ObjectId } from "mongodb";
import { getUserGroups } from "$lib/server/mongodb";
import type { Group, GroupDb } from "$lib/types.js";


export const load = async ({locals}) => {
    const user = locals.user;
    if(!user){
        return{
            groupIds: []
        }
    }
    const userId = new ObjectId(user.id);
    const groups : GroupDb[] = await getUserGroups(userId);
    const serialized : Group[] = groups.map(({_id, ...r}) =>({
        id: _id.toString(), // ObjectId is not serializable, so we convert to string
        ...r
    }))
    console.log(serialized)
    return {groups: serialized}
}
