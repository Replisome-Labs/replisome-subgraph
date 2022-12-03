import { Created as CreatedEvent } from "../generated/RasterMetadata/RasterMetadata"
import { Created } from "../generated/schema"

export function handleCreated(event: CreatedEvent): void {
  let entity = new Created(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.metadataId = event.params.metadataId
  entity.save()
}
