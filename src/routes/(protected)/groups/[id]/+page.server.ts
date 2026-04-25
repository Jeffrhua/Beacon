import { getGroup, getGroupUserRoles, getUser, checkGroupMembership, checkGroupRole, getGroupAlerts } from '$lib/server/mongodb.js'
import { ObjectId } from 'mongodb';
import { GroupActions } from '$lib/server/actions/GroupActions.js';

export const load = async ({params, locals}) => {
    // Load group related information
    const groupId = new ObjectId(params.id);
    const group = await getGroup(groupId);
    const groupUsers = await getGroupUserRoles(groupId);
    if(group == null){
        return {error: "Group not found"}
    }
    // Check owner information
    const ownerId = group.owner_id
    const owner = await getUser(ownerId);
    const ownerSerialized = owner
        ? {
            id: owner._id.toString(),
            name: owner.name,
            displayName: owner.displayName
        }
        : null;

    // Check user 
    const user_id = new ObjectId(locals.user?.id)
    const isMember = await checkGroupMembership(user_id, groupId);
    const userRole = await checkGroupRole(user_id, groupId);  
    const isAdmin = (userRole == "admin" || userRole == "owner");
    // Load users in current group
    let users = [];
    groupUsers.forEach((u)=>{
        users.push({id: u._id.toString(), name: u.name, displayName: u.displayName, role: u.role, status: u.status})
    })
    const {_id, owner_id, ...r} = group;

    const groupAlerts = await getGroupAlerts(groupId);
    return {
        group: {id: _id.toString(), ...r},
        users: users,
        owner: ownerSerialized,
        currentUser: user_id.toString(),
        isMember: isMember,
        isAdmin: isAdmin,
        alerts: groupAlerts,
        userRole: userRole,
    }
}

export const actions = GroupActions;