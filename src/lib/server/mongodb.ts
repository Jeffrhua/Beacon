import { ObjectId, type Db } from 'mongodb';
import { client } from './auth'
import type { GroupDb, UserDb, AlertDb, Alert } from '$lib/types';
import { alertDbToAlert } from '$lib/db-type-conversions';

let db: Db;
let mainDb: Db;
export async function getUserSettingDb(){
    if(!db){
      db = client.db('Beacon');
      await db.collection('user_settings').createIndex({userId:1})
      await db.collection('user_settings').createIndex({settingTypeId:1})
      await db.collection('user_settings').createIndex({value:1})
    }
    return db;
}

export async function getGroupFromAlert(alertId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const userAlertId = await mainDb.collection('alert_group').findOne(
    {
      "alert_id": alertId
    }
  )
  if(!userAlertId) return null;
  const group = await mainDb.collection('group').findOne(
    {
      "_id": userAlertId.group_id
    }
  )
  if(!group) return null;
  return group;
}

// Get all the group ids a user is a part of
export async function getUserGroupIds(userId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }
   const userGroups = await mainDb.collection("user_group").find(
    {
      "user_id": userId
    }
  ).toArray();
  const groupIds : ObjectId[] = userGroups.map((g) => g.group_id as ObjectId)
  return groupIds
}

// Get all group objects a user is a part of
export async function getUserGroups(userId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const groupIds : ObjectId[] = await getUserGroupIds(userId);
  if (groupIds.length == 0) return [];
  const groups = await mainDb.collection<GroupDb>("group").find(
    {
      _id:{
        "$in" : groupIds
      }
    }
  ).toArray();
  if (groups.length == 0) return [];
  return groups;
}

// Get all groups
export async function getAllGroups(){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const groups = await mainDb.collection<GroupDb>("group").find({}).toArray();
  return groups;
}

export async function getAlert(alertId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const alert = await mainDb.collection('alert').findOne(
    {
      "_id": alertId
    }
  )

  if(!alert) return null;
  return alert;
}
// Get all users in a group
export async function getGroupUsers(groupId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }

  if(!db){
    db = client.db('Beacon');
  }

  const groupUsers = await mainDb.collection("user_group").find(
    {
      "group_id": groupId
    }
  ).toArray();

  const userIds : ObjectId[] = groupUsers.map((u) => u.user_id as ObjectId)
  if (userIds.length == 0) return [];
  const users = await db.collection<UserDb>("user").find(
    {
      _id:{
        "$in": userIds
      }
    }
  ).toArray();

  if (users.length == 0) return [];
  return users
}

// Get group from group id
export async function getGroup(groupId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }

  const group = await mainDb.collection<GroupDb>("group").findOne(
    {
      "_id" : groupId
    }
  );
  return group;
}

// Get user from user id
export async function getUser(userId: ObjectId){
  if(!db){
    db = client.db('Beacon');
  }
  const user = await db.collection("user").findOne(
    {
      "_id": userId
    }
  );
  return user;
}

// Get all of the User's alerts from groups they're a part of
export async function getAllUserAlerts(userId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const userGroups : ObjectId[] = await getUserGroupIds(userId);
  if(userGroups.length == 0) return [];
  const userAlertIds = await mainDb.collection('alert_group').find(
    {
      "group_id" : {
        "$in":userGroups
      }
    }
  ).map((ag) => ag.alert_id)
  .toArray();
  
  const alerts = await Promise.all(
    userAlertIds.map(id => getAlert(id))
  );

  const alertsDb: AlertDb[] = alerts.filter((a): a is AlertDb => a !== null);
  const userAlerts: Alert[] = alertsDb.map(alertDbToAlert);

  return userAlerts
}

// Check if user is in a given group
export async function checkGroupMembership(userId: ObjectId, groupId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }

  const membership = await mainDb.collection("user_group").findOne(
    {
      "user_id": userId,
      "group_id": groupId
    }
  );

  return (membership != null);
}

// Add user to group
export async function addGroupMember(userId: ObjectId, groupId: ObjectId, userRole: string){
  if(!mainDb){
    mainDb = client.db('main');
  }

  try {
    await mainDb.collection("user_group").insertOne({
      "user_id": userId,
      "group_id": groupId,
      "user_role": userRole
    })
  }
  catch (error) {
    console.error("Error:", error)
  }
}

// Remove user from group
export async function removeGroupMember(userId: ObjectId, groupId: ObjectId) {
  if(!mainDb){
    mainDb = client.db('main');
  }

  try {
    await mainDb.collection("user_group").deleteOne({
      "user_id": userId,
      "group_id": groupId,
    })
  }
  catch (error) {
    console.error("Error:", error)
  }
}

// Get alerts from a group
export async function getGroupAlerts(groupId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const alert_groups = await mainDb.collection('alert_group').find(
    {
      "group_id": groupId
    }
  ).toArray();

  const alertIds = alert_groups.map((a)=>a.alert_id)
  const alertsDb: AlertDb[] = await Promise.all(
    alertIds.map((a)=>getAlert(a))
  )
  const alerts: Alert[] = await Promise.all(
    alertsDb.map((a) => alertDbToAlert(a))
  )
  return alerts;
}

// Creates a group
export async function createGroup(ownerId: ObjectId, title: String, description: String){
  if(!mainDb){
    mainDb = client.db('main');
  }

  try {
    const result = await mainDb.collection("group").insertOne({
      "title": title,
      "description": description,
      "owner_id": ownerId
    })

    const newGroupId = result.insertedId;

    if (newGroupId){
      await mainDb.collection("user_group").insertOne({
        "user_id": ownerId,
        "group_id": newGroupId,
        "user_role": "owner"
      })
    }

    return newGroupId.toString();

  }
  catch (error) {
    console.error("Error:", error)
  }

  return null;
}

// Delete group
export async function deleteGroup(userId: ObjectId, groupId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }

  const group = await getGroup(groupId);

  // Only proceed if current user is the owner
  if (group?.owner_id.equals(userId)){
    try {
      await mainDb.collection("group").deleteOne({
        "group_id": groupId
      })

      await mainDb.collection("user_group").deleteMany({
        "group_id": groupId
      })
    }
    catch (error) {
      console.error("Error:", error)
    }
  }
}

export async function getMemberCount() {
  if (!mainDb) mainDb = client.db('main');
  return await mainDb.collection("user_group").aggregate([
    { $group: { _id: "$group_id", count: { $sum: 1 } } }
  ]).toArray();
}