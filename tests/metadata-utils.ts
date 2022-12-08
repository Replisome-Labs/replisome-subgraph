import { createMockedFunction, newMockEvent } from "matchstick-as";
import { ethereum, BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { Created } from "../generated/templates/Metadata/IMetadata";
import { MetadataInfo, MetadataIngredient } from "../generated/schema";
import { formatEntityId } from "../src/helpers/common";
import { constants } from "@amxx/graphprotocol-utils";

export function createCreatedEvent(
  metadataId: BigInt,
  rawData: Bytes
): Created {
  let createdEvent = changetype<Created>(newMockEvent());

  createdEvent.parameters = new Array();

  createdEvent.parameters.push(
    new ethereum.EventParam(
      "metadataId",
      ethereum.Value.fromUnsignedBigInt(metadataId)
    )
  );
  createdEvent.parameters.push(
    new ethereum.EventParam("rawData", ethereum.Value.fromBytes(rawData))
  );

  return createdEvent;
}

export function hydrateMetadataInfo(
  contractAddress: Address,
  id: BigInt
): void {
  let info = new MetadataInfo(
    formatEntityId([contractAddress.toHex(), id.toHex()])
  );
  info.contract = contractAddress;
  info.identifier = id;
  info.width = BigInt.fromI32(16);
  info.height = BigInt.fromI32(16);
  info.colors = [];
  info.data = constants.BYTES32_ZERO;
  info.svg = "";
  info.raw = constants.BYTES32_ZERO;
  info.save();
}

export function hydrateMetadataIngredient(
  contractAddress: Address,
  id: BigInt,
  copyrightAddress: Address,
  fromTokenId: BigInt,
  amount: BigInt
): void {
  let ingredient = new MetadataIngredient(
    formatEntityId([contractAddress.toHex(), id.toHex(), fromTokenId.toHex()])
  );
  ingredient.metadata = formatEntityId([contractAddress.toHex(), id.toHex()]);
  ingredient.token = formatEntityId([
    copyrightAddress.toHex(),
    fromTokenId.toHex(),
  ]);
  ingredient.amount = amount;
  ingredient.save();
}

export function mockCopyrightCall(
  contractAddress: Address,
  copyrightAddress: Address
): void {
  createMockedFunction(contractAddress, "copyright", "copyright():(address)")
    .withArgs([])
    .returns([ethereum.Value.fromAddress(copyrightAddress)]);
}

export function mockGenerateSVG(
  contractAddress: Address,
  tokenId: BigInt
): void {
  createMockedFunction(
    contractAddress,
    "generateSVG",
    "generateSVG(uint256):(string)"
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
    .returns([ethereum.Value.fromString("svg-".concat(tokenId.toHex()))]);
}

export function mockGetIngredients(
  contractAddress: Address,
  tokenId: BigInt,
  ingredientIds: BigInt[],
  ingredientAmounts: BigInt[]
): void {
  ethereum.Value.fromUnsignedBigIntArray;
  createMockedFunction(
    contractAddress,
    "getIngredients",
    "getIngredients(uint256):(uint256[],uint256[])"
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(tokenId)])
    .returns([
      ethereum.Value.fromUnsignedBigIntArray(ingredientIds),
      ethereum.Value.fromUnsignedBigIntArray(ingredientAmounts),
    ]);
}
