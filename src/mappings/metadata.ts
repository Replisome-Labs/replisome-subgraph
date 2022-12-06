import { integers } from "@amxx/graphprotocol-utils"
import { Created } from "../../generated/templates/Metadata/IMetadata"
import { fetchMetadataContract, fetchMetadataInfo } from "../helpers/metadata"


export function handleCreated(event: Created): void {
  let contract = fetchMetadataContract(event.address)
  fetchMetadataInfo(contract, event.params.metadataId)
  integers.increment(contract.totalSupply)
  contract.save()
}
