import { GraphQLClient } from "graphql-request";

// Goldsky API endpoint for lending pool data
const PONDER_API_ENDPOINT = "https://glowing-space-bassoon-ww74g77xww43v97j-42069.app.github.dev";

export const graphClient = new GraphQLClient(PONDER_API_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});