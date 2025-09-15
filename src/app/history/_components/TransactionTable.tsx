import { Transaction } from "./types";
import { TokenDisplay } from "./TokenDisplay";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { formatTokenAmount, formatTimestamp, shortenAddress, getTokenByAddress } from "./utils";
import { ExternalLinkIcon } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  chainId?: number;
}

export function TransactionTable({ transactions, loading = false, chainId = 8217 }: TransactionTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pool
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tx Hash
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {loading ? (
              // Loading skeleton rows
              [...Array(5)].map((_, index) => (
                <tr key={`loading-${index}`} className="animate-pulse">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="text-gray-500 text-lg mb-2">No transactions found</div>
                  <div className="text-gray-400 text-sm">Your transaction history will appear here</div>
                </td>
              </tr>
            ) : (
              // Actual data rows
              transactions.map((transaction) => {
              const token = getTokenByAddress(transaction.asset, chainId);
              const formattedAmount = token 
                ? formatTokenAmount(transaction.amount, token.decimals)
                : transaction.amount.toString();

              return (
                <tr key={transaction.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <TransactionTypeBadge type={transaction.type} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-gray-800">
                      <TokenDisplay address={transaction.asset} chainId={chainId} />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">
                      {formattedAmount} {token?.symbol || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800">
                      {shortenAddress(transaction.pool)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800">
                      {formatTimestamp(transaction.timestamp)}
                    </div>
                    <div className="text-xs text-gray-800/70">
                      Block: {transaction.blockNumber.toString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <a
                      href={`https://kaiascan.io/tx/${transaction.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      {shortenAddress(transaction.transactionHash)}
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {loading ? (
          // Mobile loading skeleton
          [...Array(3)].map((_, index) => (
            <div key={`mobile-loading-${index}`} className="p-4 border-b border-gray-200/50 animate-pulse">
              <div className="flex justify-between items-start mb-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-4"></div>
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : transactions.length === 0 ? (
          // Mobile empty state
          <div className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">No transactions found</div>
            <div className="text-gray-400 text-sm">Your transaction history will appear here</div>
          </div>
        ) : (
          // Mobile data cards
          transactions.map((transaction) => {
          const token = getTokenByAddress(transaction.asset, chainId);
          const formattedAmount = token 
            ? formatTokenAmount(transaction.amount, token.decimals)
            : transaction.amount.toString();

          return (
            <div key={transaction.id} className="p-4 border-b border-gray-100/50 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <TransactionTypeBadge type={transaction.type} />
                <a
                  href={`https://klaytnscope.com/tx/${transaction.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-gray-800 hover:underline"
                >
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Asset:</span>
                  <div className="text-gray-800">
                    <TokenDisplay address={transaction.asset} chainId={chainId} />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Amount:</span>
                  <div className="text-sm font-medium text-gray-800">
                    {formattedAmount} {token?.symbol || 'Unknown'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Pool:</span>
                  <div className="text-sm text-gray-800">
                    {shortenAddress(transaction.pool)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Time:</span>
                  <div className="text-sm text-gray-800">
                    {formatTimestamp(transaction.timestamp)}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Block:</span>
                  <div className="text-xs text-gray-800/70">
                    {transaction.blockNumber.toString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}