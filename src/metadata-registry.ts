import {
  MetadataRegistryOwnerUpdated as MetadataRegistryOwnerUpdatedEvent,
  Registered as RegisteredEvent,
  Unregistered as UnregisteredEvent
} from "../generated/MetadataRegistry/MetadataRegistry"
import {
  MetadataRegistryOwnerUpdated,
  Registered,
  Unregistered
} from "../generated/schema"

export function handleMetadataRegistryOwnerUpdated(
  event: MetadataRegistryOwnerUpdatedEvent
): void {
  let entity = new MetadataRegistryOwnerUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.user = event.params.user
  entity.newOwner = event.params.newOwner
  entity.save()
}

export function handleRegistered(event: RegisteredEvent): void {
  let entity = new Registered(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.metadata = event.params.metadata
  entity.save()
}

export function handleUnregistered(event: UnregisteredEvent): void {
  let entity = new Unregistered(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.metadata = event.params.metadata
  entity.save()
}
