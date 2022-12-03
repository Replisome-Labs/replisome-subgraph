import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import {
  MetadataRegistryOwnerUpdated,
  Registered,
  Unregistered
} from "../generated/MetadataRegistry/MetadataRegistry"

export function createMetadataRegistryOwnerUpdatedEvent(
  user: Address,
  newOwner: Address
): MetadataRegistryOwnerUpdated {
  let metadataRegistryOwnerUpdatedEvent = changetype<
    MetadataRegistryOwnerUpdated
  >(newMockEvent())

  metadataRegistryOwnerUpdatedEvent.parameters = new Array()

  metadataRegistryOwnerUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  metadataRegistryOwnerUpdatedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return metadataRegistryOwnerUpdatedEvent
}

export function createRegisteredEvent(metadata: Address): Registered {
  let registeredEvent = changetype<Registered>(newMockEvent())

  registeredEvent.parameters = new Array()

  registeredEvent.parameters.push(
    new ethereum.EventParam("metadata", ethereum.Value.fromAddress(metadata))
  )

  return registeredEvent
}

export function createUnregisteredEvent(metadata: Address): Unregistered {
  let unregisteredEvent = changetype<Unregistered>(newMockEvent())

  unregisteredEvent.parameters = new Array()

  unregisteredEvent.parameters.push(
    new ethereum.EventParam("metadata", ethereum.Value.fromAddress(metadata))
  )

  return unregisteredEvent
}
