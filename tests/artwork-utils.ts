import { createMockedFunction, log, newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ApprovalForAll,
  TransferBatch,
  TransferSingle,
  URI,
} from "../generated/Artwork/IArtwork";
import { ArtworkBalance, ArtworkToken } from "../generated/schema";
import { formatEntityId } from "../src/helpers/common";

export function createApprovalForAllEvent(
  account: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent());

  approvalForAllEvent.parameters = new Array();

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  );
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  );
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  );

  return approvalForAllEvent;
}

export function createTransferBatchEvent(
  operator: Address,
  from: Address,
  to: Address,
  ids: Array<BigInt>,
  values: Array<BigInt>
): TransferBatch {
  let transferBatchEvent = changetype<TransferBatch>(newMockEvent());

  transferBatchEvent.parameters = new Array();

  transferBatchEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  );
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("ids", ethereum.Value.fromUnsignedBigIntArray(ids))
  );
  transferBatchEvent.parameters.push(
    new ethereum.EventParam(
      "values",
      ethereum.Value.fromUnsignedBigIntArray(values)
    )
  );

  return transferBatchEvent;
}

export function createTransferSingleEvent(
  operator: Address,
  from: Address,
  to: Address,
  id: BigInt,
  value: BigInt
): TransferSingle {
  let transferSingleEvent = changetype<TransferSingle>(newMockEvent());

  transferSingleEvent.parameters = new Array();

  transferSingleEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  );
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  );
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  );

  return transferSingleEvent;
}

export function createURIEvent(value: string, id: BigInt): URI {
  let uriEvent = changetype<URI>(newMockEvent());

  uriEvent.parameters = new Array();

  uriEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromString(value))
  );
  uriEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  );

  return uriEvent;
}

export function hydrateArtworkToken(
  contractAddress: Address,
  copyrightAddress: Address,
  tokenId: BigInt,
  totalSupply: BigInt,
  ownedSupply: BigInt
): void {
  if (totalSupply.gt(ownedSupply)) {
    log.error("totalSupply should not be greater than ownedSupply", []);
  }

  let artworkToken = new ArtworkToken(
    formatEntityId([contractAddress.toHex(), tokenId.toHex()])
  );
  artworkToken.copyright = formatEntityId([
    copyrightAddress.toHex(),
    tokenId.toHex(),
  ]);
  artworkToken.contract = contractAddress;
  artworkToken.identifier = tokenId;
  artworkToken.uri = "uri".concat("-").concat(tokenId.toHex());
  artworkToken.totalSupply = totalSupply;
  artworkToken.ownedSupply = ownedSupply;
  artworkToken.usedSupply = ownedSupply.minus(totalSupply);
  artworkToken.save();
}

export function hydrateArtworkBalance(
  contractAddress: Address,
  tokenId: BigInt,
  ownerAddress: Address,
  value: BigInt,
  ownedValue: BigInt
): void {
  if (value.gt(ownedValue)) {
    log.error("balance should not be greater than ownedBalance", []);
  }

  let artworkBalance = new ArtworkBalance(
    formatEntityId([
      contractAddress.toHex(),
      tokenId.toHex(),
      ownerAddress.toHex(),
    ])
  );
  artworkBalance.contract = contractAddress;
  artworkBalance.token = formatEntityId([
    contractAddress.toHex(),
    tokenId.toHex(),
  ]);
  artworkBalance.account = ownerAddress;
  artworkBalance.value = value;
  artworkBalance.ownedValue = ownedValue;
  artworkBalance.usedValue = ownedValue.minus(value);
  artworkBalance.save();
}

export function mockCopyrightCall(
  artworkAddress: Address,
  copyrightAddress: Address
): void {
  createMockedFunction(artworkAddress, "copyright", "copyright():(address)")
    .withArgs([])
    .returns([ethereum.Value.fromAddress(copyrightAddress)]);
}

export function mockUriCall(
  contractAddress: Address,
  identifier: BigInt
): void {
  createMockedFunction(contractAddress, "uri", "uri(uint256):(string)")
    .withArgs([ethereum.Value.fromUnsignedBigInt(identifier)])
    .returns([ethereum.Value.fromString("uri".concat(identifier.toHex()))]);
}
