import { gql } from "graphql-request";

export const queryLendingPool = () => {
  return gql`
    query MyQuery {
      lendingPoolCreateds(where: { blockNumber_gt: "196216958" }) {
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
      lendingPools {
        items {
          borrowAPY
          supplyAPY
          address
        }
      }
    }
  `;
};
