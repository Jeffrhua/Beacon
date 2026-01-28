import { ObjectId, type Db } from 'mongodb';
import { client } from './auth'

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

export async function getUserGroupDb(userId: ObjectId){
  if(!mainDb){
    mainDb = client.db('main');
  }
  const groups =  mainDb.collection("user_groups").find(
    {
      "user_id": {
        $eq: userId
      }
    }
  )
  while (groups){
    console.log(groups.)
  }
  console.log(groups);
  return mainDb;
}