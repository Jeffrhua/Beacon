import { ObjectId } from "mongodb";

export default class UserSetting {
    constructor(
        public userId: ObjectId, 
        public settingTypeId: ObjectId,
        public value: string,
        public id?: ObjectId) {}
}