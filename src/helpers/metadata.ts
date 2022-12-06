import { constants } from "@amxx/graphprotocol-utils"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ICopyright } from "../../generated/Copyright/ICopyright"
import { IMetadata } from "../../generated/templates/Metadata/IMetadata"
import {
  Metadata as MetadataTemplate
} from "../../generated/templates"
import { MetadataInfo, MetadataContract, MetadataIngredient } from "../../generated/schema"
import { fetchCopyrightContract, fetchCopyrightToken } from "./copyright"

export function fetchMetadataContract(address: Address): MetadataContract {
  let contract = MetadataContract.load(address)

	if (contract == null) {
    MetadataTemplate.create(address)
		contract = new MetadataContract(address)
    contract.isRegistered = false
    contract.totalSupply = constants.BIGINT_ZERO
		contract.save()
	}

	return contract
}

export function fetchMetadataInfo(contract: MetadataContract, identifier: BigInt): MetadataInfo {
  let id = contract.id.toHex().concat('/').concat(identifier.toHex())
	let metadataInfo = MetadataInfo.load(id)

  let metadata = IMetadata.bind(Address.fromBytes(contract.id))
  let copyrightAddress = metadata.copyright()
  let copyright = ICopyright.bind(copyrightAddress)
  let copyrightContract = fetchCopyrightContract(copyrightAddress)!
  let tokenId = copyright.search(Address.fromBytes(contract.id), identifier)

	if (metadataInfo == null) {
    metadataInfo = new MetadataInfo(id)
		metadataInfo.contract = contract.id
		metadataInfo.identifier = identifier
    metadataInfo.width = metadata.width(identifier)
    metadataInfo.height = metadata.height(identifier)
    metadataInfo.svg = metadata.generateSVG(identifier)
    metadataInfo.raw = metadata.generateRawData(identifier)
    metadataInfo.colors = metadata.getColors(identifier).map(c => formatColor(c))
    metadataInfo.save()
    
    let ingredientsResult = metadata.getIngredients(identifier)
    let ids = ingredientsResult.getIds()
    let amounts = ingredientsResult.getAmounts()
    for (let i = 0; i < ids.length; i++) {
      let ingredient = fetchMetadataIngredient(metadataInfo, ids[i])
      ingredient.token = fetchCopyrightToken(copyrightContract, ids[i]).id
      ingredient.amount = amounts[i]
      ingredient.save()
    }
	}
  
  if (tokenId !== constants.BIGINT_ZERO) {
    metadataInfo.copyright = fetchCopyrightToken(copyrightContract, tokenId).id
    metadataInfo.save()
  }

	return metadataInfo
}

export function fetchMetadataIngredient(info: MetadataInfo, tokenId: BigInt): MetadataIngredient {
  let id = info.id.concat('/').concat(tokenId.toHex())
  let metadataIngredient = MetadataIngredient.load(id)

  if (metadataIngredient == null) {
    metadataIngredient = new MetadataIngredient(id)
    metadataIngredient.metadata = info.id
    metadataIngredient.save()
  }

  return metadataIngredient
}

function formatColor(bytes: Bytes): string {
  return bytes.toHex().replace('0x', '#')
}