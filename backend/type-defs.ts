import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  enum TaskStatus {
    active
    completed
  }
  type Task {
    id: Int!
    title: String!
    status: TaskStatus!
  }
  input CreateTaskInput {
    title: String!
  }
  input UpdateTaskInput {
    title: String
    id: Int!
    status: TaskStatus
  }

  type Query {
    tasks(status: TaskStatus): [Task!]!
    task(id: Int!): Task
  }
  type Mutation {
    createTask(input: CreateTaskInput!): Task
    updateTask(input: UpdateTaskInput!): Task
    deleteTask(id: Int!): Task
  }
`;
