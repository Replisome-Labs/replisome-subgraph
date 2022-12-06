import { Registered, Unregistered } from "../../generated/MetadataRegistry/IMetadataRegistry"
import { fetchMetadataContract } from "../helpers/metadata"

export function handleRegistered(event: Registered): void {
  let metadataContract = fetchMetadataContract(event.params.metadata)
  metadataContract.isRegistered = true
  metadataContract.save()
}

export function handleUnregistered(event: Unregistered): void {
  let metadataContract = fetchMetadataContract(event.params.metadata)
  metadataContract.isRegistered = false
  metadataContract.save()
}
