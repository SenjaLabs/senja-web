interface TransactionFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function TransactionFilter({ selectedType, onTypeChange }: TransactionFilterProps) {
  const filterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'supply_liquidity', label: 'Supply Liquidity' },
    { value: 'withdraw_liquidity', label: 'Withdraw Liquidity' },
    { value: 'borrow_debt_crosschain', label: 'Borrow' },
    { value: 'supply_collateral', label: 'Supply Collateral' },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-white/20 mb-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onTypeChange(option.value)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              selectedType === option.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}