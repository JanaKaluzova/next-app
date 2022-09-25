import { ApolloServer, gql } from "apollo-server-micro";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { NextApiHandler } from "next";
import mysql from "serverless-mysql";
import { OkPacket } from "mysql";
import { Resolvers, TaskStatus } from "../../generated/graphql-backend";
import { UserInputError } from "apollo-server-core";

const typeDefs = gql`
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

interface ApolloContext {
  db: mysql.ServerlessMysql;
}

interface TaskDbRow {
  id: number;
  title: string;
  task_status: TaskStatus;
}

type TasksDbQueryResult = TaskDbRow[];
type TaskDbQueryResult = TaskDbRow[];

const getTaskById = async (id: number, db: mysql.ServerlessMysql) => {
  const tasks = await db.query<TaskDbQueryResult>(
    "SELECT id, title, task_status FROM tasks WHERE id = ?",
    [id]
  );
  return tasks.length
    ? {
        id: tasks[0].id,
        title: tasks[0].title,
        status: tasks[0].task_status,
      }
    : null;
};

const resolvers: Resolvers<ApolloContext> = {
  Query: {
    async tasks(parent, args, context) {
      const { status } = args;
      let query = "SELECT id, title, task_status FROM tasks";
      const queryParams: string[] = [];
      if (status) {
        query += " WHERE task_status = ?";
        queryParams.push(status);
      }
      const tasks = await context.db.query<TasksDbQueryResult>(
        query,
        queryParams
      );
      await db.end();

      return tasks.map(({ id, title, task_status }) => ({
        id,
        title,
        status: task_status,
      }));
    },
    async task(parent, args, context) {
      return await getTaskById(args.id, context.db);
    },
  },
  Mutation: {
    async createTask(parent, args, context) {
      const result = await context.db.query<OkPacket>(
        "INSERT INTO tasks (title, task_status) VALUES (?, ?)",
        [args.input.title, TaskStatus.Active]
      );
      return {
        id: result.insertId,
        title: args.input.title,
        status: TaskStatus.Active,
      };
    },
    async updateTask(parent, args, context) {
      const columns: string[] = [];
      const sqlParams: any[] = [];

      if (args.input.title) {
        columns.push("title = ?");
        sqlParams.push(args.input.title);
      }

      if (args.input.status) {
        columns.push("task_status = ?");
        sqlParams.push(args.input.status);
      }

      sqlParams.push(args.input.id);

      await context.db.query(
        `UPDATE tasks SET ${columns.join(",")} WHERE id=?`,
        sqlParams
      );

      const updateTask = await getTaskById(args.input.id, context.db);

      return updateTask;
    },
    async deleteTask(parent, args, context) {
      const task = await getTaskById(args.id, context.db);
      if (!task) {
        throw new UserInputError("no task found");
      }
      await context.db.query("DELETE FROM tasks WHERE id=?", [args.id]);
      return task;
    },
  },
};

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: { db },
  plugins: [
    ...(process.env.NODE_ENV === "development"
      ? [ApolloServerPluginLandingPageGraphQLPlayground]
      : []),
  ],
});

const serverStartPromise = apolloServer.start();
let graphqlHandler: NextApiHandler | undefined;

const handler: NextApiHandler = async (req, res) => {
  if (!graphqlHandler) {
    await serverStartPromise;
    graphqlHandler = apolloServer.createHandler({ path: "/api/graphql" });
  }

  return graphqlHandler(req, res);
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
