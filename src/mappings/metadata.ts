import { integers } from "@amxx/graphprotocol-utils";
import { Created } from "../../generated/templates/IMetadata/IMetadata";
import {
  createMetadataInfo,
  fetchMetadataContract,
  fetchMetadataInfo,
} from "../helpers/metadata";

export function handleCreated(event: Created): void {
  let contract = fetchMetadataContract(event.address);
  contract.totalSupply = integers.increment(contract.totalSupply);
  contract.save();

  let info = fetchMetadataInfo(contract, event.params.metadataId);
  createMetadataInfo(info, event.params.rawData);
}
