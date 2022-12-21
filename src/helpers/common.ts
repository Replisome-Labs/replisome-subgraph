import { Bytes, ethereum, TypedMap } from "@graphprotocol/graph-ts";
import { Transaction } from "../../generated/schema";

export const actionTable = new TypedMap<number, string>();
actionTable.set(0, "CopyrightClaim");
actionTable.set(1, "CopyrightWaive");
actionTable.set(2, "CopyrightSale");
actionTable.set(3, "ArtworkCopy");
actionTable.set(4, "ArtworkBurn");
actionTable.set(5, "ArtworkUtilize");

export function formatEntityId(args: string[]): string {
  return args.join("-");
}

export function supportsInterface(
  contract: ethereum.SmartContract,
  interfaceId: string,
  expected: boolean = true
): boolean {
  let result = ethereum.call(
    new ethereum.SmartContractCall(
      contract._name, // '',
      contract._address, // address,
      "supportsInterface", // '',
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(Bytes.fromHexString(interfaceId))]
    )
  );

  return (
    result != null &&
    (result as Array<ethereum.Value>)[0].toBoolean() == expected
  );
}

export namespace events {
  export function id(event: ethereum.Event): string {
    return event.block.number
      .toString()
      .concat("-")
      .concat(event.logIndex.toString());
  }
}

export namespace transactions {
  export function log(event: ethereum.Event): Transaction {
    let tx = new Transaction(event.transaction.hash.toHex());
    tx.timestamp = event.block.timestamp;
    tx.blockNumber = event.block.number;
    tx.save();
    return tx as Transaction;
  }
  export type Tx = Transaction;
}
