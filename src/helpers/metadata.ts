import { constants } from "@amxx/graphprotocol-utils";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { IMetadata } from "../../generated/templates/IMetadata/IMetadata";
import { IMetadata as IMetadataTemplate } from "../../generated/templates";
import {
  MetadataInfo,
  MetadataContract,
  MetadataIngredient,
} from "../../generated/schema";
import { fetchCopyrightContract, fetchCopyrightToken } from "./copyright";
import { formatEntityId } from "./common";

export function fetchMetadataContract(address: Address): MetadataContract {
  let contract = MetadataContract.load(address);

  if (contract == null) {
    IMetadataTemplate.create(address);
    contract = new MetadataContract(address);
    contract.isRegistered = false;
    contract.totalSupply = constants.BIGINT_ZERO;
  }

  return contract;
}

export function fetchMetadataInfo(
  contract: MetadataContract,
  identifier: BigInt
): MetadataInfo {
  let id = formatEntityId([contract.id.toHex(), identifier.toHex()]);
  let metadataInfo = MetadataInfo.load(id);

  if (metadataInfo == null) {
    let metadata = IMetadata.bind(Address.fromBytes(contract.id));
    let copyrightAddress = metadata.copyright();
    let copyrightContract = fetchCopyrightContract(copyrightAddress);

    metadataInfo = new MetadataInfo(id);
    metadataInfo.contract = contract.id;
    metadataInfo.identifier = identifier;
    metadataInfo.width = constants.BIGINT_ZERO;
    metadataInfo.height = constants.BIGINT_ZERO;
    metadataInfo.colors = [];
    metadataInfo.data = constants.BYTES32_ZERO;
    metadataInfo.raw = constants.BYTES32_ZERO;

    let try_generateSVG = metadata.try_generateSVG(identifier);
    metadataInfo.svg = try_generateSVG.reverted ? "" : try_generateSVG.value;

    let try_getIngredients = metadata.try_getIngredients(identifier);
    if (!try_getIngredients.reverted) {
      let ingredientsResult = try_getIngredients.value;
      let ids = ingredientsResult.getIds();
      let amounts = ingredientsResult.getAmounts();
      for (let i = 0; i < ids.length; i++) {
        let ingredient = fetchMetadataIngredient(metadataInfo, ids[i]);
        ingredient.token = fetchCopyrightToken(copyrightContract, ids[i]).id;
        ingredient.amount = amounts[i];
        ingredient.save();
      }
    }
  }

  return metadataInfo;
}

export function fetchMetadataIngredient(
  info: MetadataInfo,
  tokenId: BigInt
): MetadataIngredient {
  let id = formatEntityId([info.id, tokenId.toHex()]);
  let metadataIngredient = MetadataIngredient.load(id);

  if (metadataIngredient == null) {
    metadataIngredient = new MetadataIngredient(id);
    metadataIngredient.metadata = info.id;
  }

  return metadataIngredient;
}

class IMetadata__decodeRawDataResult {
  width: BigInt;
  height: BigInt;
  colors: Array<Bytes>;
  data: Bytes;

  constructor(
    width: BigInt,
    height: BigInt,
    colors: Array<Bytes>,
    data: Bytes
  ) {
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.data = data;
  }

  getWidth(): BigInt {
    return this.width;
  }

  getHeight(): BigInt {
    return this.height;
  }

  getColors(): Array<Bytes> {
    return this.colors;
  }

  getData(): Bytes {
    return this.data;
  }
}

export function decodeMetadataRawData(
  raw: Bytes
): IMetadata__decodeRawDataResult {
  let tupleRawData = Bytes.fromHexString(
    "0x0000000000000000000000000000000000000000000000000000000000000020"
  ).concat(raw);
  const decoded = ethereum.decode(
    "(uint256,uint256,bytes4[],bytes)",
    tupleRawData
  );

  if (!decoded) {
    throw new Error("something wrong in raw data");
  }

  let tupleDecoded = decoded.toTuple();

  return new IMetadata__decodeRawDataResult(
    tupleDecoded[0].toBigInt(),
    tupleDecoded[1].toBigInt(),
    tupleDecoded[2].toBytesArray(),
    tupleDecoded[3].toBytes()
  );
}

export function formatColor(bytes: Bytes): string {
  return bytes.toHex().replace("0x", "#");
}
