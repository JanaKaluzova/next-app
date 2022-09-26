import { typeDefs } from "./type-defs";
import { resolvers } from "./resolvers";

const { makeExecutableSchema } = require("@graphql-tools/schema");

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
