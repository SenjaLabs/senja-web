import { gql } from "graphql-request";

export const queryLendingPool = () => {
  return gql`
    query MyQuery {
      lendingPoolCreateds {
        items {
          id
          lendingPool
          collateralToken
          borrowToken
          ltv
        }
      }
    }
  `;
};
