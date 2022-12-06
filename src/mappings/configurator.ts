import {
  CopyrightRendererUpdated as CopyrightRendererUpdatedEvent,
  FeeTokenUpdated as FeeTokenUpdatedEvent,
  FeeUpdated as FeeUpdatedEvent,
  OwnerUpdated as OwnerUpdatedEvent,
  TreaturyUpdated as TreaturyUpdatedEvent
} from "../generated/Configurator/Configurator"
import {
  CopyrightRendererUpdated,
  FeeTokenUpdated,
  FeeUpdated,
  OwnerUpdated,
  TreaturyUpdated
} from "../generated/schema"

export function handleCopyrightRendererUpdated(
  event: CopyrightRendererUpdatedEvent
): void {
  let entity = new CopyrightRendererUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.renderer = event.params.renderer
  entity.save()
}

export function handleFeeTokenUpdated(event: FeeTokenUpdatedEvent): void {
  let entity = new FeeTokenUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.token = event.params.token
  entity.save()
}

export function handleFeeUpdated(event: FeeUpdatedEvent): void {
  let entity = new FeeUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.action = event.params.action
  entity.feeFormula = event.params.feeFormula
  entity.save()
}

export function handleOwnerUpdated(event: OwnerUpdatedEvent): void {
  let entity = new OwnerUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.user = event.params.user
  entity.newOwner = event.params.newOwner
  entity.save()
}

export function handleTreaturyUpdated(event: TreaturyUpdatedEvent): void {
  let entity = new TreaturyUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.vault = event.params.vault
  entity.save()
}
