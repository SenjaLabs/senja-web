import { gql } from 'graphql-request';

export const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($user: String!) {
    supplyLiquiditys(
      where: { user: $user }
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      items {
        id
        user
        pool
        asset
        amount
        shares
        onBehalfOf
        timestamp
        blockNumber
        transactionHash
      }
    }

    withdrawLiquiditys(
      where: { user: $user }
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      items {
        id
        user
        pool
        asset
        amount
        shares
        to
        timestamp
        blockNumber
        transactionHash
      }
    }

    supplyCollaterals(
      where: { user: $user }
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      items {
        id
        user
        pool
        asset
        amount
        onBehalfOf
        timestamp
        blockNumber
        transactionHash
      }
    }
  }
`;

export const GET_ALL_TRANSACTIONS = gql`
  query GetAllTransactions {
    supplyLiquiditys(
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      items {
        id
        user
        pool
        asset
        amount
        shares
        onBehalfOf
        timestamp
        blockNumber
        transactionHash
      }
    }

    withdrawLiquiditys(
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      items {
        id
        user
        pool
        asset
        amount
        shares
        to
        timestamp
        blockNumber
        transactionHash
      }
    }

    supplyCollaterals(
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      items {
        id
        user
        pool
        asset
        amount
        onBehalfOf
        timestamp
        blockNumber
        transactionHash
      }
    }
  }
`;

export interface GraphQLTransactionResponse {
  supplyLiquiditys: {
    items: Array<{
      id: string;
      user: string;
      pool: string;
      asset: string;
      amount: string;
      shares: string;
      onBehalfOf: string;
      timestamp: string;
      blockNumber: string;
      transactionHash: string;
    }>;
  };
  withdrawLiquiditys: {
    items: Array<{
      id: string;
      user: string;
      pool: string;
      asset: string;
      amount: string;
      shares: string;
      to: string;
      timestamp: string;
      blockNumber: string;
      transactionHash: string;
    }>;
  };
  supplyCollaterals: {
    items: Array<{
      id: string;
      user: string;
      pool: string;
      asset: string;
      amount: string;
      onBehalfOf: string;
      timestamp: string;
      blockNumber: string;
      transactionHash: string;
    }>;
  };
}