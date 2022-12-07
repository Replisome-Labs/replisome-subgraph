import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  CopyrightRendererUpdated,
  FeeTokenUpdated,
  FeeUpdated,
  OwnerUpdated,
  TreaturyUpdated,
} from "../generated/Configurator/Configurator";

export function createCopyrightRendererUpdatedEvent(
  renderer: Address
): CopyrightRendererUpdated {
  let copyrightRendererUpdatedEvent = changetype<CopyrightRendererUpdated>(
    newMockEvent()
  );

  copyrightRendererUpdatedEvent.parameters = new Array();

  copyrightRendererUpdatedEvent.parameters.push(
    new ethereum.EventParam("renderer", ethereum.Value.fromAddress(renderer))
  );

  return copyrightRendererUpdatedEvent;
}

export function createFeeTokenUpdatedEvent(token: Address): FeeTokenUpdated {
  let feeTokenUpdatedEvent = changetype<FeeTokenUpdated>(newMockEvent());

  feeTokenUpdatedEvent.parameters = new Array();

  feeTokenUpdatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  );

  return feeTokenUpdatedEvent;
}

export function createFeeUpdatedEvent(
  action: i32,
  feeFormula: Address
): FeeUpdated {
  let feeUpdatedEvent = changetype<FeeUpdated>(newMockEvent());

  feeUpdatedEvent.parameters = new Array();

  feeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "action",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(action))
    )
  );
  feeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "feeFormula",
      ethereum.Value.fromAddress(feeFormula)
    )
  );

  return feeUpdatedEvent;
}

export function createOwnerUpdatedEvent(
  user: Address,
  newOwner: Address
): OwnerUpdated {
  let ownerUpdatedEvent = changetype<OwnerUpdated>(newMockEvent());

  ownerUpdatedEvent.parameters = new Array();

  ownerUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  );
  ownerUpdatedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  );

  return ownerUpdatedEvent;
}

export function createTreaturyUpdatedEvent(vault: Address): TreaturyUpdated {
  let treaturyUpdatedEvent = changetype<TreaturyUpdated>(newMockEvent());

  treaturyUpdatedEvent.parameters = new Array();

  treaturyUpdatedEvent.parameters.push(
    new ethereum.EventParam("vault", ethereum.Value.fromAddress(vault))
  );

  return treaturyUpdatedEvent;
}
