import { createMockedFunction, newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Approval,
  ApprovalForAll,
  PropertyRulesetUpdated,
  Transfer,
} from "../generated/Copyright/ICopyright";
import {
  CopyrightContract,
  CopyrightToken,
  Ruleset,
} from "../generated/schema";
import { formatEntityId } from "../src/helpers/common";

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent());

  approvalEvent.parameters = new Array();

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  );
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  );
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return approvalEvent;
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent());

  approvalForAllEvent.parameters = new Array();

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  );
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  );
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  );

  return approvalForAllEvent;
}

export function createPropertyRulesetUpdatedEvent(
  tokenId: BigInt,
  ruleset: Address
): PropertyRulesetUpdated {
  let propertyRulesetUpdatedEvent = changetype<PropertyRulesetUpdated>(
    newMockEvent()
  );

  propertyRulesetUpdatedEvent.parameters = new Array();

  propertyRulesetUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );
  propertyRulesetUpdatedEvent.parameters.push(
    new ethereum.EventParam("ruleset", ethereum.Value.fromAddress(ruleset))
  );

  return propertyRulesetUpdatedEvent;
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent());

  transferEvent.parameters = new Array();

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return transferEvent;
}

export function hydrateCopyContract(contractAddress: Address): void {
  let contract = new CopyrightContract(contractAddress);
  contract.name = "HiggsPixel Copyright";
  contract.symbol = "CPRT";
  contract.save();
}

export function hydrateCopyrightToken(
  contractAddress: Address,
  tokenId: BigInt,
  artworkAddress: Address,
  metadataAddress: Address,
  metadataId: BigInt,
  rulesetAddress: Address,
  creatorAddress: Address,
  ownerAddress: Address,
  operatorAddress: Address
): void {
  let token = new CopyrightToken(
    formatEntityId([contractAddress.toHex(), tokenId.toHex()])
  );
  token.contract = contractAddress;
  token.identifier = tokenId;
  token.uri = "uri".concat(tokenId.toHex());
  token.artwork = formatEntityId([artworkAddress.toHex(), tokenId.toHex()]);
  token.metadata = formatEntityId([
    metadataAddress.toHex(),
    metadataId.toHex(),
  ]);
  token.ruleset = rulesetAddress;
  token.creator = creatorAddress;
  token.owner = ownerAddress;
  token.approval = operatorAddress;
  token.save();
}

export function mockNameCall(contractAddress: Address): void {
  createMockedFunction(contractAddress, "name", "name():(string)")
    .withArgs([])
    .returns([ethereum.Value.fromString("HiggsPixel Copyright")]);
}

export function mockSymbolCall(contractAddress: Address): void {
  createMockedFunction(contractAddress, "symbol", "symbol():(string)")
    .withArgs([])
    .returns([ethereum.Value.fromString("CPRT")]);
}
