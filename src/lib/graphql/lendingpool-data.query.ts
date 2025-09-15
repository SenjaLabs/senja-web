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

export const queryLendingPoolApy = () => {
  return gql`
    query MyQuery {
      poolAPYSnapshots(
        where: {}
        limit: 1
        orderDirection: "desc"
        orderBy: "blockNumber"
      ) {
        items {
          supplyAPY
          borrowAPY
          pool
        }
      }
    }
  `;
};
