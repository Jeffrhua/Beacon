import { ObjectId } from "mongodb";

export default class User {
    constructor(
        public firstName: string, 
        public lastName: string, 
        public email: string,
        public phoneNumber: string,
        public createdAt?: Date,
        public id?: ObjectId) {}
}