import { newMockEvent } from "matchstick-as";
import { ethereum, Address } from "@graphprotocol/graph-ts";
import {
  OwnerUpdated,
  Registered,
  Unregistered,
} from "../generated/MetadataRegistry/MetadataRegistry";

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

export function createRegisteredEvent(metadata: Address): Registered {
  let registeredEvent = changetype<Registered>(newMockEvent());

  registeredEvent.parameters = new Array();

  registeredEvent.parameters.push(
    new ethereum.EventParam("metadata", ethereum.Value.fromAddress(metadata))
  );

  return registeredEvent;
}

export function createUnregisteredEvent(metadata: Address): Unregistered {
  let unregisteredEvent = changetype<Unregistered>(newMockEvent());

  unregisteredEvent.parameters = new Array();

  unregisteredEvent.parameters.push(
    new ethereum.EventParam("metadata", ethereum.Value.fromAddress(metadata))
  );

  return unregisteredEvent;
}
