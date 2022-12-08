import {
  assert,
  test,
  clearStore,
  beforeEach,
  afterEach,
  beforeAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { handleCreated } from "../src/mappings/metadata";
import {
  createCreatedEvent,
  mockCopyrightCall,
  mockGenerateSVG,
  mockGetIngredients,
} from "./metadata-utils";
import { formatEntityId } from "../src/helpers/common";
import { hydrateCopyContract, hydrateCopyrightToken } from "./copyright-utils";

let contractAddress = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
let copyrightAddress = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);
let artworkAddress = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
let rulesetAddress = Address.fromString(
  "0x0000000000000000000000000000000000000004"
);
let creatorAddress = Address.fromString(
  "0x0000000000000000000000000000000000000005"
);
let ownerAddress = Address.fromString(
  "0x0000000000000000000000000000000000000006"
);
let operatorAddress = Address.fromString(
  "0x0000000000000000000000000000000000000007"
);
let metadataId = BigInt.fromI32(5);

beforeAll(() => {
  mockCopyrightCall(contractAddress, copyrightAddress);
  mockGenerateSVG(contractAddress, metadataId);
  mockGetIngredients(
    contractAddress,
    metadataId,
    [BigInt.fromI32(1)],
    [BigInt.fromI32(2)]
  );
});

beforeEach(() => {
  hydrateCopyContract(copyrightAddress);
  hydrateCopyrightToken(
    copyrightAddress,
    BigInt.fromI32(1),
    artworkAddress,
    contractAddress,
    BigInt.fromI32(1),
    rulesetAddress,
    creatorAddress,
    ownerAddress,
    operatorAddress
  );
});

afterEach(() => {
  clearStore();
});

test("event:Created", () => {
  let rawData = Bytes.fromHexString(
    "0x00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000265c73eff00000000000000000000000000000000000000000000000000000000c73d3dff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000020202000000000000020202000000000200020000000000000200020000000002000202000000000002000200000002020000020202020202020002020000020000000000000000000000000202000200000101000000000101000000020002000001010000000001010000000200020200000000000000000000000202000002000000000000000000000002000000020000000000000000000000020000000200000001010101000000020200000002020000000000000000000200000000000202020000000000020200000000000000000202020202020200000000"
  );
  let event = createCreatedEvent(metadataId, rawData);
  event.address = contractAddress;

  handleCreated(event);

  assert.fieldEquals(
    "MetadataContract",
    contractAddress.toHex(),
    "totalSupply",
    "1"
  );
  assert.fieldEquals(
    "MetadataInfo",
    formatEntityId([contractAddress.toHex(), metadataId.toHex()]),
    "contract",
    contractAddress.toHex()
  );
  assert.fieldEquals(
    "MetadataInfo",
    formatEntityId([contractAddress.toHex(), metadataId.toHex()]),
    "identifier",
    metadataId.toString()
  );
  assert.fieldEquals(
    "MetadataInfo",
    formatEntityId([contractAddress.toHex(), metadataId.toHex()]),
    "width",
    "16"
  );
  assert.fieldEquals(
    "MetadataInfo",
    formatEntityId([contractAddress.toHex(), metadataId.toHex()]),
    "height",
    "16"
  );
  assert.fieldEquals(
    "MetadataInfo",
    formatEntityId([contractAddress.toHex(), metadataId.toHex()]),
    "colors",
    "[#65c73eff, #c73d3dff]"
  );
  assert.fieldEquals(
    "MetadataInfo",
    formatEntityId([contractAddress.toHex(), metadataId.toHex()]),
    "data",
    "0x00000000000000000000000000000000000000000000000000000000000000000000020202000000000000020202000000000200020000000000000200020000000002000202000000000002000200000002020000020202020202020002020000020000000000000000000000000202000200000101000000000101000000020002000001010000000001010000000200020200000000000000000000000202000002000000000000000000000002000000020000000000000000000000020000000200000001010101000000020200000002020000000000000000000200000000000202020000000000020200000000000000000202020202020200000000"
  );
  assert.fieldEquals(
    "MetadataInfo",
    formatEntityId([contractAddress.toHex(), metadataId.toHex()]),
    "raw",
    rawData.toHexString()
  );
  assert.fieldEquals(
    "MetadataInfo",
    formatEntityId([contractAddress.toHex(), metadataId.toHex()]),
    "svg",
    "svg-".concat(metadataId.toHex())
  );
  assert.fieldEquals(
    "MetadataIngredient",
    formatEntityId([
      contractAddress.toHex(),
      metadataId.toHex(),
      BigInt.fromI32(1).toHex(),
    ]),
    "amount",
    BigInt.fromI32(2).toString()
  );
});
