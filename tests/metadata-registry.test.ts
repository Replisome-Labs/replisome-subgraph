import {
  assert,
  test,
  clearStore,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address } from "@graphprotocol/graph-ts";
import {
  handleRegistered,
  handleUnregistered,
} from "../src/mappings/metadata-registry";
import {
  createRegisteredEvent,
  createUnregisteredEvent,
} from "./metadata-registry-utils";

export { handleRegistered, handleUnregistered };

let contractAddress = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
let metadataAddress = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);

afterAll(() => {
  clearStore();
});

test("event:Registered", () => {
  let event = createRegisteredEvent(metadataAddress);
  event.address = contractAddress;

  handleRegistered(event);

  assert.fieldEquals(
    "MetadataContract",
    metadataAddress.toHex(),
    "isRegistered",
    "true"
  );
});

test("event:Unregistered", () => {
  let event = createUnregisteredEvent(metadataAddress);
  event.address = contractAddress;

  handleUnregistered(event);

  assert.fieldEquals(
    "MetadataContract",
    metadataAddress.toHex(),
    "isRegistered",
    "false"
  );
});
