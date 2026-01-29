import type { ObjectId } from "mongodb";
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