import { Address } from "@graphprotocol/graph-ts";
import {
  Registered,
  Unregistered,
} from "../../generated/MetadataRegistry/MetadataRegistry";
import { IMetadata } from "../../generated/templates/IMetadata/IMetadata";
import { fetchMetadataContract } from "../helpers/metadata";

export function handleRegistered(event: Registered): void {
  let metadataContract = fetchMetadataContract(event.params.metadata);
  metadataContract.isRegistered = true;

  let metadata = IMetadata.bind(Address.fromBytes(event.params.metadata));
  let try_MIMEType = metadata.try_MIMEType();
  metadataContract.MIMEType = try_MIMEType.reverted ? "" : try_MIMEType.value;

  metadataContract.save();
}

export function handleUnregistered(event: Unregistered): void {
  let metadataContract = fetchMetadataContract(event.params.metadata);
  metadataContract.isRegistered = false;
  metadataContract.save();
}
