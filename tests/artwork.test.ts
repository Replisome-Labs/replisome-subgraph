import {
  assert,
  test,
  clearStore,
  beforeEach,
  afterEach,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  handleApprovalForAll,
  handleTransferBatch,
  handleTransferSingle,
  handleUnutilized,
  handleUtilized,
} from "../src/mappings/artwork";
import { events, formatEntityId } from "../src/helpers/common";
import {
  createApprovalForAllEvent,
  createTransferBatchEvent,
  createTransferSingleEvent,
  createUnutilizedEvent,
  createUtilizedEvent,
  hydrateArtworkBalance,
  hydrateArtworkToken,
} from "./artwork-utils";

export {
  handleApprovalForAll,
  handleTransferBatch,
  handleTransferSingle,
  handleUnutilized,
  handleUtilized,
};

let contractAddress = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
let copyrightAddress = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);
let ownerAddress = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
let receiverAddress = Address.fromString(
  "0x0000000000000000000000000000000000000004"
);
let operatorAddress = Address.fromString(
  "0x0000000000000000000000000000000000000005"
);
let tokenAId = BigInt.fromI32(1);
let tokenBId = BigInt.fromI32(2);

beforeEach(() => {
  hydrateArtworkToken(
    contractAddress,
    copyrightAddress,
    tokenAId,
    BigInt.fromI32(50),
    BigInt.fromI32(100)
  );
  hydrateArtworkToken(
    contractAddress,
    copyrightAddress,
    tokenBId,
    BigInt.fromI32(50),
    BigInt.fromI32(100)
  );
  hydrateArtworkBalance(
    contractAddress,
    tokenAId,
    ownerAddress,
    BigInt.fromI32(10),
    BigInt.fromI32(15)
  );
  hydrateArtworkBalance(
    contractAddress,
    tokenBId,
    ownerAddress,
    BigInt.fromI32(5),
    BigInt.fromI32(10)
  );
});

afterEach(() => {
  clearStore();
});

test("event:ApprovalForAll", () => {
  let event = createApprovalForAllEvent(ownerAddress, operatorAddress, true);
  event.address = contractAddress;

  handleApprovalForAll(event);

  let id = formatEntityId([
    contractAddress.toHex(),
    ownerAddress.toHex(),
    operatorAddress.toHex(),
  ]);
  assert.fieldEquals("ArtworkOperator", id, "owner", ownerAddress.toHex());
  assert.fieldEquals(
    "ArtworkOperator",
    id,
    "operator",
    operatorAddress.toHex()
  );
  assert.fieldEquals("ArtworkOperator", id, "approved", "true");
});

test("event:TransferBatch", () => {
  let event = createTransferBatchEvent(
    operatorAddress,
    ownerAddress,
    receiverAddress,
    [tokenAId, tokenBId],
    [BigInt.fromI32(5), BigInt.fromI32(3)]
  );
  event.address = contractAddress;

  handleTransferBatch(event);

  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      ownerAddress.toHex(),
    ]),
    "value",
    "5"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      ownerAddress.toHex(),
    ]),
    "ownedValue",
    "10"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      receiverAddress.toHex(),
    ]),
    "value",
    "5"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      receiverAddress.toHex(),
    ]),
    "ownedValue",
    "5"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenBId.toHex(),
      ownerAddress.toHex(),
    ]),
    "value",
    "2"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenBId.toHex(),
      ownerAddress.toHex(),
    ]),
    "ownedValue",
    "7"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenBId.toHex(),
      receiverAddress.toHex(),
    ]),
    "value",
    "3"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenBId.toHex(),
      receiverAddress.toHex(),
    ]),
    "ownedValue",
    "3"
  );
});

test("event:TransferSingle", () => {
  let event = createTransferSingleEvent(
    operatorAddress,
    ownerAddress,
    receiverAddress,
    tokenAId,
    BigInt.fromI32(5)
  );
  event.address = contractAddress;

  handleTransferSingle(event);

  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      ownerAddress.toHex(),
    ]),
    "value",
    "5"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      ownerAddress.toHex(),
    ]),
    "ownedValue",
    "10"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      receiverAddress.toHex(),
    ]),
    "value",
    "5"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      receiverAddress.toHex(),
    ]),
    "ownedValue",
    "5"
  );
  assert.fieldEquals(
    "ArtworkTransfer",
    formatEntityId([events.id(event), ""]),
    "from",
    ownerAddress.toHex()
  );
  assert.fieldEquals(
    "ArtworkTransfer",
    formatEntityId([events.id(event), ""]),
    "to",
    receiverAddress.toHex()
  );
  assert.fieldEquals(
    "ArtworkTransfer",
    formatEntityId([events.id(event), ""]),
    "value",
    "5"
  );
});

test("event:Utilized", () => {
  let event = createUtilizedEvent(
    ownerAddress,
    [tokenAId],
    [BigInt.fromI32(2)]
  );
  event.address = contractAddress;

  handleUtilized(event);

  assert.fieldEquals(
    "ArtworkToken",
    formatEntityId([contractAddress.toHex(), tokenAId.toHex()]),
    "usedSupply",
    "52"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      ownerAddress.toHex(),
    ]),
    "value",
    "8"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      ownerAddress.toHex(),
    ]),
    "usedValue",
    "7"
  );
});

test("event:Unutilized", () => {
  let event = createUnutilizedEvent(
    ownerAddress,
    [tokenAId],
    [BigInt.fromI32(2)]
  );
  event.address = contractAddress;

  handleUnutilized(event);

  assert.fieldEquals(
    "ArtworkToken",
    formatEntityId([contractAddress.toHex(), tokenAId.toHex()]),
    "usedSupply",
    "48"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      ownerAddress.toHex(),
    ]),
    "value",
    "12"
  );
  assert.fieldEquals(
    "ArtworkBalance",
    formatEntityId([
      contractAddress.toHex(),
      tokenAId.toHex(),
      ownerAddress.toHex(),
    ]),
    "usedValue",
    "3"
  );
});
