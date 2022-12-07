import {
  assert,
  test,
  clearStore,
  beforeEach,
  afterEach,
  beforeAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  handleApproval,
  handleApprovalForAll,
  handlePropertyRulesetUpdated,
  handleTransfer,
} from "../src/mappings/copyright";
import {
  createApprovalEvent,
  createApprovalForAllEvent,
  createPropertyRulesetUpdatedEvent,
  createTransferEvent,
  hydrateCopyrightToken,
  mockNameCall,
  mockSymbolCall,
} from "./copyright-utils";
import { events, formatEntityId } from "../src/helpers/common";
import { constants } from "@amxx/graphprotocol-utils";

let contractAddress = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
let artworkAddress = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);
let metadataAddress = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
let rulesetAddress = Address.fromString(
  "0x0000000000000000000000000000000000000004"
);
let ownerAddress = Address.fromString(
  "0x0000000000000000000000000000000000000005"
);
let receiverAddress = Address.fromString(
  "0x0000000000000000000000000000000000000006"
);
let operatorAddress = Address.fromString(
  "0x0000000000000000000000000000000000000007"
);
let creatorAddress = Address.fromString(
  "0x0000000000000000000000000000000000000008"
);
let tokenId = BigInt.fromI32(1);
let metadataId = BigInt.fromI32(1);

beforeAll(() => {
  mockNameCall(contractAddress);
  mockSymbolCall(contractAddress);
});

beforeEach(() => {
  hydrateCopyrightToken(
    contractAddress,
    tokenId,
    artworkAddress,
    metadataAddress,
    metadataId,
    constants.ADDRESS_ZERO,
    creatorAddress,
    ownerAddress,
    constants.ADDRESS_ZERO
  );
});

afterEach(() => {
  clearStore();
});

test("event:Approval", () => {
  let event = createApprovalEvent(ownerAddress, operatorAddress, tokenId);
  event.address = contractAddress;

  handleApproval(event);

  assert.fieldEquals(
    "CopyrightToken",
    formatEntityId([contractAddress.toHex(), tokenId.toHex()]),
    "owner",
    ownerAddress.toHex()
  );
  assert.fieldEquals(
    "CopyrightToken",
    formatEntityId([contractAddress.toHex(), tokenId.toHex()]),
    "approval",
    operatorAddress.toHex()
  );
});

test("event:ApprovalForAll", () => {
  let event = createApprovalForAllEvent(ownerAddress, operatorAddress, true);
  event.address = contractAddress;

  handleApprovalForAll(event);

  assert.fieldEquals(
    "CopyrightOperator",
    formatEntityId([
      contractAddress.toHex(),
      ownerAddress.toHex(),
      operatorAddress.toHex(),
    ]),
    "approved",
    "true"
  );
});

test("event:PropertyRulesetUpdated", () => {
  let event = createPropertyRulesetUpdatedEvent(tokenId, rulesetAddress);
  event.address = contractAddress;

  handlePropertyRulesetUpdated(event);

  assert.fieldEquals(
    "CopyrightToken",
    formatEntityId([contractAddress.toHex(), tokenId.toHex()]),
    "ruleset",
    rulesetAddress.toHex()
  );
});

test("event:Transfer", () => {
  let event = createTransferEvent(ownerAddress, receiverAddress, tokenId);
  event.address = contractAddress;

  handleTransfer(event);

  let id = formatEntityId([contractAddress.toHex(), tokenId.toHex()]);

  assert.fieldEquals("CopyrightToken", id, "owner", receiverAddress.toHex());
  assert.fieldEquals(
    "CopyrightToken",
    id,
    "approval",
    constants.ADDRESS_ZERO.toHex()
  );
  assert.fieldEquals(
    "CopyrightTransfer",
    events.id(event),
    "from",
    ownerAddress.toHex()
  );
  assert.fieldEquals(
    "CopyrightTransfer",
    events.id(event),
    "to",
    receiverAddress.toHex()
  );
  assert.fieldEquals("CopyrightTransfer", events.id(event), "token", id);
});
