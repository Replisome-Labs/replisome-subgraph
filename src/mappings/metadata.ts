import { integers } from "@amxx/graphprotocol-utils";
import { Bytes } from "@graphprotocol/graph-ts";
import { Created } from "../../generated/templates/IMetadata/IMetadata";
import {
  decodeMetadataRawData,
  fetchMetadataContract,
  fetchMetadataInfo,
  formatColor,
} from "../helpers/metadata";

export function handleCreated(event: Created): void {
  let contract = fetchMetadataContract(event.address);
  contract.totalSupply = integers.increment(contract.totalSupply);
  contract.save();

  let info = fetchMetadataInfo(contract, event.params.metadataId);
  let decodedResult = decodeMetadataRawData(event.params.rawData);
  info.width = decodedResult.getWidth();
  info.height = decodedResult.getHeight();
  info.colors = decodedResult
    .getColors()
    .map<string>((c: Bytes) => formatColor(c));
  info.data = decodedResult.getData();
  info.raw = event.params.rawData;
  info.save();
}
