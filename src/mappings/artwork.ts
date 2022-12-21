import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  ApprovalForAll,
  TransferBatch,
  TransferSingle,
  Utilized,
  Unutilized,
  RoyaltyTransfer as RoyaltyTransferEvent,
} from "../../generated/Artwork/Artwork";
import {
  Account,
  ArtworkContract,
  ArtworkTransfer,
  RoyaltyTransfer,
} from "../../generated/schema";
import { fetchAccount } from "../helpers/account";
import {
  fetchArtworkBalance,
  fetchArtworkContract,
  fetchArtworkOperator,
  fetchArtworkToken,
  fetchERC20Contract,
} from "../helpers/artwork";
import {
  actionTable,
  events,
  formatEntityId,
  transactions,
} from "../helpers/common";

export function handleApprovalForAll(event: ApprovalForAll): void {
  let contract = fetchArtworkContract(event.address);
  let owner = fetchAccount(event.params.account);
  let operator = fetchAccount(event.params.operator);
  let delegation = fetchArtworkOperator(contract, owner, operator);
  delegation.approved = event.params.approved;
  delegation.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  let contract = fetchArtworkContract(event.address);
  let operator = fetchAccount(event.params.operator);
  let from = fetchAccount(event.params.from);
  let to = fetchAccount(event.params.to);

  let ids = event.params.ids;
  let values = event.params.values;

  // If this equality doesn't hold (some devs actually don't follox the ERC specifications) then we just can't make
  // sens of what is happening. Don't try to make something out of stupid code, and just throw the event. This
  // contract doesn't follow the standard anyway.
  if (ids.length == values.length) {
    for (let i = 0; i < ids.length; ++i) {
      registerTransfer(
        event,
        "/".concat(i.toString()),
        contract,
        operator,
        from,
        to,
        ids[i],
        values[i]
      );
    }
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let contract = fetchArtworkContract(event.address);
  let operator = fetchAccount(event.params.operator);
  let from = fetchAccount(event.params.from);
  let to = fetchAccount(event.params.to);

  registerTransfer(
    event,
    "",
    contract,
    operator,
    from,
    to,
    event.params.id,
    event.params.value
  );
}

export function handleUtilized(event: Utilized): void {
  let contract = fetchArtworkContract(event.address);
  let account = fetchAccount(event.params.account);

  let ids = event.params.ids;
  let values = event.params.values;

  if (ids.length == values.length) {
    for (let i = 0; i < ids.length; ++i) {
      let token = fetchArtworkToken(contract, ids[i]);
      let balance = fetchArtworkBalance(token, account);

      token.totalSupply = token.totalSupply.minus(values[i]);
      token.usedSupply = token.usedSupply.plus(values[i]);
      balance.value = balance.value.minus(values[i]);
      balance.usedValue = balance.usedValue.plus(values[i]);

      token.save();
      balance.save();
    }
  }
}

export function handleUnutilized(event: Unutilized): void {
  let contract = fetchArtworkContract(event.address);
  let account = fetchAccount(event.params.account);

  let ids = event.params.ids;
  let values = event.params.values;

  if (ids.length == values.length) {
    for (let i = 0; i < ids.length; ++i) {
      let token = fetchArtworkToken(contract, ids[i]);
      let balance = fetchArtworkBalance(token, account);

      token.totalSupply = token.totalSupply.plus(values[i]);
      token.usedSupply = token.usedSupply.minus(values[i]);
      balance.value = balance.value.plus(values[i]);
      balance.usedValue = balance.usedValue.minus(values[i]);

      token.save();
      balance.save();
    }
  }
}

export function handleRoyaltyTransfer(event: RoyaltyTransferEvent): void {
  let ev = new RoyaltyTransfer(events.id(event));
  ev.emitter = event.address;
  ev.transaction = transactions.log(event).id;
  ev.timestamp = event.block.timestamp;
  ev.from = fetchAccount(event.params.from).id;
  ev.to = fetchAccount(event.params.to).id;
  ev.value = event.params.value;
  ev.token = fetchERC20Contract(event.params.token).id;
  let action = actionTable.get(event.params.action);
  ev.action = action ? action : "";
  ev.save();
}

function registerTransfer(
  event: ethereum.Event,
  suffix: string,
  contract: ArtworkContract,
  operator: Account,
  from: Account,
  to: Account,
  id: BigInt,
  value: BigInt
): void {
  let token = fetchArtworkToken(contract, id);
  let ev = new ArtworkTransfer(formatEntityId([events.id(event), suffix]));
  ev.emitter = token.contract;
  ev.transaction = transactions.log(event).id;
  ev.timestamp = event.block.timestamp;
  ev.contract = contract.id;
  ev.token = token.id;
  ev.operator = operator.id;
  ev.value = value;

  if (from.id == Address.zero()) {
    token.totalSupply = token.totalSupply.plus(value);
    token.ownedSupply = token.ownedSupply.plus(value);
  } else {
    let balance = fetchArtworkBalance(token, from);
    balance.value = balance.value.minus(value);
    balance.ownedValue = balance.ownedValue.minus(value);
    balance.save();

    ev.from = from.id;
    ev.fromBalance = balance.id;
  }

  if (to.id == Address.zero()) {
    token.totalSupply = token.totalSupply.minus(value);
    token.ownedSupply = token.ownedSupply.minus(value);
  } else {
    let balance = fetchArtworkBalance(token, to);
    balance.value = balance.value.plus(value);
    balance.ownedValue = balance.ownedValue.plus(value);
    balance.save();

    ev.to = to.id;
    ev.toBalance = balance.id;
  }

  token.save();
  ev.save();
}
