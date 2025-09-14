import { GraphQLClient } from "graphql-request";

// Goldsky API endpoint for lending pool data
const PONDER_API_ENDPOINT = "https://senja-graphql-api.zeabur.app";

export const graphClient = new GraphQLClient(PONDER_API_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});