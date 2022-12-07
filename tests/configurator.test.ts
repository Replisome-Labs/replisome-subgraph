import {
  assert,
  test,
  clearStore,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address } from "@graphprotocol/graph-ts";
import {
  handleFeeTokenUpdated,
  handleFeeUpdated,
  handleOwnerUpdated,
  handleTreaturyUpdated,
} from "../src/mappings/configurator";
import {
  createFeeTokenUpdatedEvent,
  createFeeUpdatedEvent,
  createOwnerUpdatedEvent,
  createTreaturyUpdatedEvent,
} from "./configurator-utils";
import { actionTable, formatEntityId } from "../src/helpers/common";

let contractAddress = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
let treaturyAddress = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);
let oldOwnerAddress = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
let newOwnerAddress = Address.fromString(
  "0x0000000000000000000000000000000000000004"
);
let feeTokenAddress = Address.fromString(
  "0x0000000000000000000000000000000000000005"
);
let feeFormulaAddress = Address.fromString(
  "0x0000000000000000000000000000000000000006"
);

afterAll(() => {
  clearStore();
});

test("event:FeeTokenUpdated", () => {
  let event = createFeeTokenUpdatedEvent(feeTokenAddress);
  event.address = contractAddress;

  handleFeeTokenUpdated(event);

  assert.fieldEquals(
    "Configurator",
    contractAddress.toHex(),
    "feeToken",
    feeTokenAddress.toHex()
  );
});

test("event:FeeUpdated", () => {
  let event = createFeeUpdatedEvent(0, feeFormulaAddress);
  event.address = contractAddress;

  handleFeeUpdated(event);

  assert.fieldEquals(
    "FeeFormula",
    formatEntityId([contractAddress.toHex(), "0"]),
    "value",
    feeFormulaAddress.toHex()
  );
});

test("event:OwnerUpdated", () => {
  let event = createOwnerUpdatedEvent(oldOwnerAddress, newOwnerAddress);
  event.address = contractAddress;

  handleOwnerUpdated(event);

  assert.fieldEquals(
    "Configurator",
    contractAddress.toHex(),
    "owner",
    newOwnerAddress.toHex()
  );
});

test("event:TreaturyUpdated", () => {
  let event = createTreaturyUpdatedEvent(treaturyAddress);
  event.address = contractAddress;

  handleTreaturyUpdated(event);

  assert.fieldEquals(
    "Configurator",
    contractAddress.toHex(),
    "treatury",
    treaturyAddress.toHex()
  );
});
