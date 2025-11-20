import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';
const uri = MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db: Db;

export async function getDb(){
    if(!db){
      await client.connect();
      db = client.db('Beacon');
      await db.collection('users').createIndex({firstname:1})
      await db.collection('users').createIndex({lastname:1})
      await db.collection('users').createIndex({email:1},{unique: true})
    }
    return db;
}

export async function createUser(){
    
}