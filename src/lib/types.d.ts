import type { Double, ObjectId } from "mongodb";
export type GroupDb = {
  _id: ObjectId,
  title: string,
  description: string,
  owner_id: ObjectId
};

export type Group = {
    id: string,
    title: string,
    description: string,
    owner_id: string
}

export type UserDb = {
  _id: ObjectId,
  name: string,
  email: string
}

export type User = {
  id: string,
  name: string,
  email: string
}

export type AlertDb = {
  _id: ObjectId,
  title: string,
  description: string,
  severity: string,
  longitude: Double,
  latitude: Double,
  address: string,
  user_id: ObjectId,
  dateCreated: Date,
  submittedBy?: string
}

export type Alert = {
  id: string,
  title: string,
  description: string,
  severity: string,
  longitude: Double,
  latitude: Double,
  address: string,
  user_id: string,
  dateCreated: Date
}

export type GroupChat = {
  id: string,
  participants: Array<string>,
  userDetails: Array<User>
}

export type Message = {
  id: string,
  conversation_id: string,
  sender_id: string,
  content: string
}