import { createMockedFunction, newMockEvent } from "matchstick-as";
import { ethereum, BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { Created } from "../generated/templates/Metadata/IMetadata";

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
