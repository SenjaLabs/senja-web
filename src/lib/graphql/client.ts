import { GraphQLClient } from "graphql-request";

// Goldsky API endpoint for lending pool data
const PONDER_API_ENDPOINT = "https://friendly-invention-ww74g77x6wjfvjg7-42069.app.github.dev";

export const graphClient = new GraphQLClient(PONDER_API_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});