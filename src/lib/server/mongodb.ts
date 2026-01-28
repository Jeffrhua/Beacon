import { ObjectId, type Db } from 'mongodb';
import { client } from './auth'
import type { GroupDb } from '$lib/types';

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