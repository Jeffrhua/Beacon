import { ObjectId, type Db } from 'mongodb';
import { client } from './auth'
import type { GroupDb, UserDb, AlertDb, Alert} from '$lib/types';
import { alertDbToAlert } from '$lib/db-type-conversions';

const GroupRoles = ["owner", "admin", "moderator", "member"]

let db: Db;
async function ensureDb() {
  if (!db) {
    db = client.db("main");

    await db.collection("user_settings").createIndex({ userId: 1 });
    await db.collection("user_settings").createIndex({ settingTypeId: 1 });
    await db.collection("user_settings").createIndex({ value: 1 });

    await db.collection("friend").createIndex(
      { user_id: 1, friend_id: 1 },
      { unique: true }
    );
  }
  return db;
}
// Given an alert, find the group object it came from
export async function getGroupFromAlert(alertId: ObjectId){
const db = await ensureDb();
  // find the alert_group object with the given alertId
  const userAlertId = await db.collection('alert_group').findOne(
    {
      "alert_id": alertId
    }
  )
  if(!userAlertId) return null;
  // the alert_group object that is found 
  const group = await db.collection('group').findOne(
    {
      "_id": userAlertId.group_id
    }
  )
  if(!group) return null;
  return group;
}

// Get all the group ids a user is a part of
export async function getUserGroupIds(userId: ObjectId){
const db = await ensureDb();
  // find all the user_group objects
   const userGroups = await db.collection("user_group").find(
    {
      "user_id": userId
    }
  ).toArray();
  // convert all the group objects to ObjectIds
  const groupIds : ObjectId[] = userGroups.map((g) => g.group_id as ObjectId)
  return groupIds
}

// Get all group objects a user is a part of
export async function getUserGroups(userId: ObjectId){
const db = await ensureDb();
  const groupIds : ObjectId[] = await getUserGroupIds(userId);
  if (groupIds.length == 0) return [];
  const groups = await db.collection<GroupDb>("group").find(
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
const db = await ensureDb();
  const groups = await db.collection<GroupDb>("group").find({}).toArray();
  return groups;
}

// Get alert from id
export async function getAlert(alertId: ObjectId){
const db = await ensureDb();
  // find the alert object from a given alertId
  const alert_object = await db.collection<AlertDb>('alert').findOne(
    {
      "_id": alertId
    }
  )
  
  if(!alert_object) return null;
  return alert_object;
}

// Get all users in a group
export async function getGroupUsers(groupId: ObjectId){
const db = await ensureDb();

  // get the user_group object from the given id
  const groupUsers = await db.collection("user_group").find(
    {
      "group_id": groupId
    }
  ).toArray();

  // get all the user_ids from the user_group object
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

export async function getGroupUserRoles(groupId: ObjectId){
const db = await ensureDb();

  const groupUsers = await db.collection("user_group").find(
    {
      "group_id": groupId
    }
  ).toArray();
  const userIds : ObjectId[] = groupUsers.map((u) => u.user_id as ObjectId);
  if (userIds.length == 0) return [];

  const users = await db.collection<UserDb>("user").find(
    {
      _id:{
        "$in": userIds
      }
    }
  ).toArray();
  if (users.length == 0) return [];


  return users.map((u) => {
    const role = groupUsers.find(g => g.user_id.equals(u._id))?.user_role ?? "member";
    return {
      ...u,
      role: role
    }
  });
  
}

// Get group from group id
export async function getGroup(groupId: ObjectId){
const db = await ensureDb();

  const group = await db.collection<GroupDb>("group").findOne(
    {
      "_id" : groupId
    }
  );
  return group;
}

// Get user from user id
export async function getUser(userId: ObjectId){
const db = await ensureDb();
  const user = await db.collection("user").findOne(
    {
      "_id": userId
    }
  );
  return user;
}

// Get all of the User's alerts from groups they're a part of
export async function getAllUserAlerts(userId: ObjectId) {
  const db = await ensureDb();

  const userGroups: ObjectId[] = await getUserGroupIds(userId);
  if (userGroups.length === 0) return [];

  const alerts = await db.collection("alert_group").aggregate([
    {
      $match: {
        group_id: { $in: userGroups }
      }
    },
    {
      $lookup: {
        from: "alert",
        localField: "alert_id",
        foreignField: "_id",
        as: "alertDetails"
      }
    },
    {
      $unwind: "$alertDetails"
    },
    {
      $lookup: {
        from: "user",
        localField: "alertDetails.user_id",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    {
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: "$alertDetails._id",
        title: "$alertDetails.title",
        description: "$alertDetails.description",
        severity: "$alertDetails.severity",
        longitude: "$alertDetails.longitude",
        latitude: "$alertDetails.latitude",
        address: "$alertDetails.address",
        user_id: "$alertDetails.user_id",
        userDetails: 1
      }
    }
  ]).toArray();

  return alerts;
}

// Check if user is in a given group
export async function checkGroupMembership(userId: ObjectId, groupId: ObjectId){
const db = await ensureDb();

  const membership = await db.collection("user_group").findOne(
    {
      "user_id": userId,
      "group_id": groupId
    }
  );

  return (membership != null);
}

// Check if user is a certain role in a given group
export async function checkGroupRole(userId: ObjectId, groupId: ObjectId){
const db = await ensureDb();
  //Find the user_group for user and group
  const entry = await db.collection("user_group").findOne(
    {
      "user_id": userId,
      "group_id": groupId
    }
  );
  // if no entry, return null
    return entry?.user_role ?? null;
}

// Add user to group
export async function addGroupMember(userId: ObjectId, groupId: ObjectId, userRole: string){
const db = await ensureDb();

  try {
    await db.collection("user_group").insertOne({
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
const db = await ensureDb();

  try {
    await db.collection("user_group").deleteOne({
      "user_id": userId,
      "group_id": groupId,
    })
  }
  catch (error) {
    console.error("Error:", error)
  }
}

//Update a user's role in a group
export async function updateGroupMemberRole(userId: ObjectId, groupId: ObjectId, newRole: string){
const db = await ensureDb();
  try {
    await db.collection("user_group").updateOne({
      "user_id": userId,
      "group_id": groupId,
    },
    {
      $set: {
        "user_role": newRole
      }
    })
  }
  catch (error) {
    console.error("Error:", error)
  }
}

//Transfer group ownership to another user
export async function transferGroupOwnership(currentOwnerId: ObjectId, newOwnerId: ObjectId, groupId: ObjectId){
const db = await ensureDb();

  try{
    await db.collection("group").updateOne(
      {
        "_id": groupId
      },
      { $set: {
        "owner_id": newOwnerId
      }}
    );

    await updateGroupMemberRole(currentOwnerId, groupId, "admin");
    await updateGroupMemberRole(newOwnerId, groupId, "owner");
  }
  catch (error) {
    console.error("Error:", error)
  }
}

// Get alerts from a group
export async function getGroupAlerts(groupId: ObjectId){
const db = await ensureDb();
  // get alert_group objects
  const alert_groups = await db.collection('alert_group').find(
    {
      "group_id": groupId
    }
  ).toArray();
  // convert the alert_group objects to a list of id's
  const alertIds = alert_groups.map((a)=>a.alert_id)
  // Map each id to an alertdb object
  const alertsDb: AlertDb[] = await Promise.all(
    alertIds.map((a)=>getAlert(a))
  )
  // map each alertdb object to an alert object
  const alerts: Alert[] = await Promise.all(
    alertsDb.map((a) => alertDbToAlert(a))
  )
  return alerts;
}

// Creates a group
export async function createGroup(ownerId: ObjectId, title: String, description: String){
const db = await ensureDb();
  try {
    const result = await db.collection("group").insertOne({
      "title": title,
      "description": description,
      "owner_id": ownerId
    })

    const newGroupId = result.insertedId;

    if (newGroupId){
      await db.collection("user_group").insertOne({
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
const db = await ensureDb();
  const group = await getGroup(groupId);

  // Only proceed if current user is the owner
  if (group?.owner_id.equals(userId)){
    try {
      await db.collection("group").deleteOne({
        "group_id": groupId
      })

      await db.collection("user_group").deleteMany({
        "group_id": groupId
      })
    }
    catch (error) {
      console.error("Error:", error)
    }
  }
}

// Update a group
export async function updateGroup(group: GroupDb){
const db = await ensureDb();
  
  try {
    await db.collection("group").updateOne(
      {_id: group._id},
      { $set: group }
    )
  }
  catch (error) {
    console.error("Error:", error)
  }
}

// Aggregrate member counts for all groups
export async function getMemberCount() {
  const db = await ensureDb();
  
  //Group by id and count each member
  return await db.collection("user_group").aggregate([
    { $group: { _id: "$group_id", count: { $sum: 1 } } }
  ]).toArray();
}

// Get all users from a group
export async function getUsersFromGroup(id: ObjectId){
  const db = await ensureDb();
  // Find all user id's that are in the given group
  let user_groups = await db.collection("user_group").find(
    {
      "group_id" : id
    }
  ).toArray()
  // extract each user_group entity to be just the user_id
  let user_ids = user_groups.map((e) => e.user_id)
  // go through all users that are in the user_ids list
  const users = await db.collection("user").find(
    {
      _id: {"$in": user_ids}
    }
  ).toArray()
  return users
}

// Add a new chat group between "x" amount of users
export async function createChatGroup(participants: Array<ObjectId>){
const db = await ensureDb();

  try {
    await db.collection("conversation").insertOne({
      "participants": participants
    })
  }
  catch (error) {
    console.error("Error:", error)
  }
}

// Get all chats a user is a part of
export async function getAllChatGroups(userId: ObjectId){
 const db = await ensureDb();

  // Get all chats a user is a part of, return the details of each user in each chat
  const chats = await db.collection("conversation").aggregate([
    {
      $match: {
        participants: userId
      }
    },
    {
      $lookup: {
        from: "user",
        localField: "participants",
        foreignField: "_id",
        as: "userDetails"
      }
    }
  ]).toArray();

  return chats;
}

export async function getUserFriends(userId: ObjectId){
  const db = await ensureDb();

  const user_friends = await db.collection("friend").find({
    "user_id" : userId
  }).toArray()

  const friends = await Promise.all(
    user_friends.map(uf => getUser(uf.friend_id))
  );
  return friends;
}

export async function addFriend(currentUser: ObjectId, otherUser: ObjectId){
  const db = await ensureDb();
  try {
    await db.collection("friend").insertOne({
      "user_id": currentUser,
      "friend_id": otherUser
    })
  }
  catch (error) {
    console.error("Error:", error)
  }
}

export async function removeFriend(currentUser: ObjectId, otherUser: ObjectId){
  const db = await ensureDb();
  try {
    await db.collection("friend").deleteOne({
      "user_id": currentUser,
      "friend_id": otherUser
    })
  } catch (error) {
    console.error("Error:", error)
  }
}

export async function getAllUsers(excludedUsers : ObjectId[]) {
  const db = await ensureDb();

  const users = await db.collection('user').find({
    _id: {
      $nin: excludedUsers
    }
  }).toArray();
  return users;
}

export async function getAllMsgs(conversationId: ObjectId){
  const db = await ensureDb();

  const msgs = await db.collection('conversation_message').find({
    conversation_id: conversationId
  }).sort({ createdAt: 1 }).toArray();

  return msgs;
}

// ─── Escalation ──────────────────────────────────────────────────────────────

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];

function normalizeSeverity(s: string): string {
  return s === 'moderate' ? 'medium' : s;
}

export async function createEscalationRecord(alertId: ObjectId, severity: string) {
  const db = await ensureDb();
  const normalized = normalizeSeverity(severity);
  await db.collection('alert_escalation').insertOne({
    alert_id: alertId,
    autoEscalate: true,
    escalateAfterMinutes: 30,
    baseSeverity: normalized,
    currentSeverity: normalized,
    lastEscalatedAt: new Date(),
    escalationCount: 0,
    acknowledgedBy: [],
    ackThreshold: 5,
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    history: [{ severity: normalized, reason: 'created', at: new Date() }]
  });
}

export async function getEscalationRecord(alertId: ObjectId) {
  const db = await ensureDb();
  return db.collection('alert_escalation').findOne({ alert_id: alertId });
}

export async function getEscalationRecords(alertIds: ObjectId[]) {
  const db = await ensureDb();
  return db.collection('alert_escalation').find({ alert_id: { $in: alertIds } }).toArray();
}

export async function evaluateEscalation(alertId: ObjectId): Promise<void> {
  const db = await ensureDb();
  const record = await db.collection('alert_escalation').findOne({ alert_id: alertId });
  if (!record || record.resolved || !record.autoEscalate) return;

  const minutesSince = (Date.now() - new Date(record.lastEscalatedAt).getTime()) / 60_000;
  if (minutesSince < record.escalateAfterMinutes) return;

  const idx = SEVERITY_ORDER.indexOf(record.currentSeverity);
  if (idx === -1 || idx >= SEVERITY_ORDER.length - 1) return;

  const newSeverity = SEVERITY_ORDER[idx + 1];
  const now = new Date();

  await db.collection('alert_escalation').updateOne(
    { alert_id: alertId },
    {
      $set: { currentSeverity: newSeverity, lastEscalatedAt: now, escalationCount: record.escalationCount + 1 },
      $push: { history: { severity: newSeverity, reason: 'time', at: now } }
    }
  );

  await db.collection('alert').updateOne({ _id: alertId }, { $set: { severity: newSeverity } });
}

export async function acknowledgeAlertEscalation(alertId: ObjectId, userId: ObjectId): Promise<void> {
  const db = await ensureDb();

  const record = await db.collection('alert_escalation').findOneAndUpdate(
    { alert_id: alertId, acknowledgedBy: { $ne: userId } },
    { $push: { acknowledgedBy: userId } },
    { returnDocument: 'after' }
  );

  if (!record || record.resolved) return;

  const ackCount = record.acknowledgedBy.length;
  if (ackCount < record.ackThreshold) return;

  const idx = SEVERITY_ORDER.indexOf(record.currentSeverity);
  if (idx === -1 || idx >= SEVERITY_ORDER.length - 1) return;

  const newSeverity = SEVERITY_ORDER[idx + 1];
  const now = new Date();

  await db.collection('alert_escalation').updateOne(
    { alert_id: alertId },
    {
      $set: { currentSeverity: newSeverity, lastEscalatedAt: now, escalationCount: record.escalationCount + 1, acknowledgedBy: [] },
      $push: { history: { severity: newSeverity, reason: 'acknowledgment', at: now } }
    }
  );

  await db.collection('alert').updateOne({ _id: alertId }, { $set: { severity: newSeverity } });
}

export async function resolveAlertEscalation(alertId: ObjectId, userId: ObjectId): Promise<void> {
  const db = await ensureDb();
  const record = await db.collection('alert_escalation').findOne({ alert_id: alertId });
  if (!record) return;

  const now = new Date();
  await db.collection('alert_escalation').updateOne(
    { alert_id: alertId },
    {
      $set: { resolved: true, resolvedBy: userId, resolvedAt: now },
      $push: { history: { severity: record.currentSeverity, reason: 'resolved', at: now } }
    }
  );
}

// ─── Location Sharing ─────────────────────────────────────────────────────────

export async function upsertLocationShare(
  userId: ObjectId,
  data: { latitude: number; longitude: number; accuracy: number; sharingWith: ObjectId[]; isActive: boolean }
) {
  const db = await ensureDb();
  await db.collection('location_share').updateOne(
    { user_id: userId },
    { $set: { ...data, user_id: userId, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function getLocationShare(userId: ObjectId) {
  const db = await ensureDb();
  return db.collection('location_share').findOne({ user_id: userId });
}

export async function stopLocationShare(userId: ObjectId) {
  const db = await ensureDb();
  await db.collection('location_share').updateOne(
    { user_id: userId },
    { $set: { isActive: false, updatedAt: new Date() } }
  );
}

export async function updateLocationCoords(userId: ObjectId, latitude: number, longitude: number, accuracy: number) {
  const db = await ensureDb();
  await db.collection('location_share').updateOne(
    { user_id: userId },
    { $set: { latitude, longitude, accuracy, updatedAt: new Date() } }
  );
}

export async function getFriendsSharedLocations(userId: ObjectId) {
  const db = await ensureDb();
  return db.collection('location_share').aggregate([
    { $match: { isActive: true, sharingWith: userId } },
    {
      $lookup: {
        from: 'user',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        _id: 0,
        id: { $toString: '$user_id' },
        name: '$userDetails.name',
        latitude: 1,
        longitude: 1,
        accuracy: 1,
        updatedAt: 1
      }
    }
  ]).toArray();
}

// Update an alert's severity level
export async function updateAlertSeverity(alerts: { _id: string; alertSeverity: string }[]) {
  if (alerts.length === 0) return;

  const db = await ensureDb();

  // Batch update requests
  const operations = alerts.map((alert) => ({
    updateOne: {
      filter: { _id: new ObjectId(alert._id) },
      update: {
        $set: {
          severity: alert.alertSeverity
        }
      }
    }
  }));

  await db.collection("alert").bulkWrite(operations);
}