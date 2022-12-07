import {
  assert,
  describe,
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
} from "../src/mappings/artwork";
import { events, formatEntityId } from "../src/helpers/common";
import {
  createApprovalForAllEvent,
  createTransferBatchEvent,
  createTransferSingleEvent,
  hydrateArtworkBalance,
  hydrateArtworkToken,
} from "./artwork-utils";

let ownerAddress = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
let receiverAddress = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);
let operatorAddress = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
let contractAddress = Address.fromString(
  "0x0000000000000000000000000000000000000004"
);
let copyrightAddress = Address.fromString(
  "0x0000000000000000000000000000000000000005"
);
let tokenAId = BigInt.fromI32(1);
let tokenBId = BigInt.fromI32(2);

describe("Artwork", () => {
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
    assert.fieldEquals(
      "ArtworkOperator",
      id,
      "owner",
      "0x0000000000000000000000000000000000000001"
    );
    assert.fieldEquals(
      "ArtworkOperator",
      id,
      "operator",
      "0x0000000000000000000000000000000000000003"
    );
    assert.fieldEquals("ArtworkOperator", id, "approved", "true");
  });

  test("event:TransferBatch", () => {
    let event = createTransferBatchEvent(
      operatorAddress,
      ownerAddress,
      receiverAddress,
      [BigInt.fromI32(1)],
      [BigInt.fromI32(5)]
    );
    event.address = contractAddress;

    handleTransferBatch(event);

    // assert.fieldEquals("ArtworkToken");
    // assert.fieldEquals("ArtworkBalance");
    // assert.fieldEquals("ArtworkBalance");
    // assert.fieldEquals("ArtworkTransfer");
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
        receiverAddress.toHex(),
      ]),
      "value",
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
});
