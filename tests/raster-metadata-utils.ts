import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import { Created } from "../generated/RasterMetadata/RasterMetadata"

export function createCreatedEvent(metadataId: BigInt): Created {
  let createdEvent = changetype<Created>(newMockEvent())

  createdEvent.parameters = new Array()

  createdEvent.parameters.push(
    new ethereum.EventParam(
      "metadataId",
      ethereum.Value.fromUnsignedBigInt(metadataId)
    )
  )

  return createdEvent
}
