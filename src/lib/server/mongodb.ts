import type { Db } from 'mongodb';
import { client } from './auth'

let db: Db;

export async function getUserSettingDb(){
    if(!db){
      db = client.db('Beacon');
      await db.collection('user_settings').createIndex({userId:1})
      await db.collection('user_settings').createIndex({settingTypeId:1})
      await db.collection('user_settings').createIndex({value:1})
    }
    return db;
}