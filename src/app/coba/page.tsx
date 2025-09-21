"use client"
import { useBalance } from "wagmi";
import { kaia } from "wagmi/chains";

function Page() {
  const { data: balance } = useBalance({
    address: "0x0000000000000000000000000000000000000001",
    chainId: kaia.id,
  });

  return <div>{balance?.formatted}</div>;
}

export default Page;
