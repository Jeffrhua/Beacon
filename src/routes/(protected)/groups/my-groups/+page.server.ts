import { Db, ObjectId } from "mongodb";
import { getUserGroupDb } from "$lib/server/mongodb";

const db: Db = await  getUserGroupDb(new ObjectId("697932a0a13762fd0a3d6eb1"));