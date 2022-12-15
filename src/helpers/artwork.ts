import { constants } from "@amxx/graphprotocol-utils";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Artwork } from "../../generated/Artwork/Artwork";
import {
  Account,
  ArtworkBalance,
  ArtworkContract,
  ArtworkOperator,
  ArtworkToken,
} from "../../generated/schema";
import { formatEntityId } from "./common";
import { fetchCopyrightContract, fetchCopyrightToken } from "./copyright";

export function fetchArtworkContract(address: Address): ArtworkContract {
  let contract = ArtworkContract.load(address);

  if (contract == null) {
    contract = new ArtworkContract(address);
    contract.save();
  }

  return contract;
}

export function fetchArtworkToken(
  contract: ArtworkContract,
  identifier: BigInt
): ArtworkToken {
  let id = formatEntityId([contract.id.toHex(), identifier.toHex()]);
  let token = ArtworkToken.load(id);

  if (token == null) {
    let artwork = Artwork.bind(Address.fromBytes(contract.id));
    let try_uri = artwork.try_uri(identifier);
    let copyrightAddress = artwork.copyright();
    token = new ArtworkToken(id);
    token.contract = contract.id;
    token.identifier = identifier;
    token.totalSupply = constants.BIGINT_ZERO;
    token.ownedSupply = constants.BIGINT_ZERO;
    token.usedSupply = constants.BIGINT_ZERO;
    token.uri = try_uri.reverted ? "" : try_uri.value;
    token.copyright = formatEntityId([
      copyrightAddress.toHex(),
      identifier.toHex(),
    ]);
  }

  return token;
}

export function fetchArtworkBalance(
  token: ArtworkToken,
  account: Account
): ArtworkBalance {
  let id = formatEntityId([token.id, account.id.toHex()]);
  let balance = ArtworkBalance.load(id);

  if (balance == null) {
    balance = new ArtworkBalance(id);
    balance.contract = token.contract;
    balance.token = token.id;
    balance.account = account.id;
    balance.value = constants.BIGINT_ZERO;
    balance.ownedValue = constants.BIGINT_ZERO;
    balance.usedValue = constants.BIGINT_ZERO;
  }

  return balance;
}

export function fetchArtworkOperator(
  contract: ArtworkContract,
  owner: Account,
  operator: Account
): ArtworkOperator {
  let id = formatEntityId([
    contract.id.toHex(),
    owner.id.toHex(),
    operator.id.toHex(),
  ]);
  let op = ArtworkOperator.load(id);

  if (op == null) {
    op = new ArtworkOperator(id);
    op.contract = contract.id;
    op.owner = owner.id;
    op.operator = operator.id;
  }

  return op;
}
