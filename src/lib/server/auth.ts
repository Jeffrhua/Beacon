import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { MONGODB_URI,  BETTER_AUTH_SECRET} from '$env/static/private';

import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(MONGODB_URI);
await client.connect();

// Change this to client.db("Beacon") after testing...
const db = client.db("Beacon");
export { client };

export const auth = betterAuth({
    secret: BETTER_AUTH_SECRET,
    database: mongodbAdapter(db,{
        client
    }),
    emailAndPassword: {    
        enabled: true,
        autoSignIn: false
    } 
})