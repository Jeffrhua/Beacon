import { ObjectId, type Db } from 'mongodb';
import { client } from './auth'
import type { GroupDb, UserDb } from '$lib/types';

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

// Get all groups a user is a part of
export async function getUserGroups(userId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const userGroups = await mainDb.collection("user_group").find(
    {
      "user_id": userId
    }
  ).toArray();

  const groupIds : ObjectId[] = userGroups.map((g) => g.group_id as ObjectId)
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

export async function getAllGroups(){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const groups = await mainDb.collection<GroupDb>("group").find({}).toArray();
  return groups;
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

export async function getUser(userId: ObjectId){
  if(!db){
    db = client.db('Beacon');
  }
  const user = await db.collection("user").findOne(
    {
      "_id": userId
    }
  );
  console.log(userId)
  return user;
}