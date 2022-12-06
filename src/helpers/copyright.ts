import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { ICopyright } from "../../generated/Copyright/ICopyright";
import { Account, CopyrightContract, CopyrightOperator, CopyrightProvanance, CopyrightToken, MetadataIngredient } from "../../generated/schema";
import { fetchAccount } from "./account";
import { fetchArtworkContract, fetchArtworkToken } from "./artwork";
import { supportsInterface } from "./common";
import { fetchMetadataContract, fetchMetadataInfo } from "./metadata";

export function fetchCopyrightContract(address: Address): CopyrightContract | null {
  let copyright   = ICopyright.bind(address)
  let introspection_01ffc9a7 = supportsInterface(copyright, '01ffc9a7') // ERC165
  let introspection_80ac58cd = supportsInterface(copyright, '80ac58cd') // ERC721
  let introspection_00000000 = supportsInterface(copyright, '00000000', false)
  let isERC721               = introspection_01ffc9a7 && introspection_80ac58cd && introspection_00000000

	let contract = CopyrightContract.load(address)
  if (contract == null && isERC721) {
    contract = new CopyrightContract(address)
		let try_name = copyright.try_name()
		let try_symbol = copyright.try_symbol()
		contract.name = try_name.reverted   ? '' : try_name.value
		contract.symbol = try_symbol.reverted ? '' : try_symbol.value
		contract.save()
  }

	return contract
}

export function fetchCopyrightToken(contract: CopyrightContract, identifier: BigInt): CopyrightToken {
  let id = contract.id.toHex().concat('/').concat(identifier.toHex())
	let token = CopyrightToken.load(id)
  
	if (token == null) {
    let copyright = ICopyright.bind(Address.fromBytes(contract.id))
    let artworkAddress = copyright.artwork()
    let try_metadata = copyright.try_metadataOf(identifier)
    let try_creator = copyright.try_creatorOf(identifier)
    let try_ruleset = copyright.try_rulesetOf(identifier)
    let try_tokenURI = copyright.try_tokenURI(identifier)

		token = new CopyrightToken(id)
		token.contract = contract.id
		token.identifier = identifier
		token.approval = fetchAccount(Address.zero()).id
    token.artwork = fetchArtworkToken(fetchArtworkContract(artworkAddress), identifier).id
    token.creator = fetchAccount(try_creator.reverted ? Address.zero() : try_creator.value).id
    token.ruleset = try_ruleset.reverted ? Address.zero() : try_ruleset.value
    token.uri = try_tokenURI.reverted ? '' : try_tokenURI.value

    if (try_metadata.reverted) {
      log.error('copyright do not have any metadata: {}', [identifier.toString()]);
      token.metadata = ''
    } else {
      let metadataInfo = fetchMetadataInfo(
        fetchMetadataContract(try_metadata.value.getMetadata()),
        try_metadata.value.getMetadataId()
      )
      token.metadata = metadataInfo.id

      for (let i = 0; i < metadataInfo.ingredients.length; i++) {
        let ingredient = MetadataIngredient.load(metadataInfo.ingredients[i])
        if (ingredient == null) continue
        let provanance = fetchCopyrightProvanance(ingredient.token, id)
        provanance.amount = ingredient.amount
        provanance.save()
      }
    }
	}

	return token
}

export function fetchCopyrightOperator(contract: CopyrightContract, owner: Account, operator: Account): CopyrightOperator {
  let id = contract.id.toHex().concat('/').concat(owner.id.toHex()).concat('/').concat(operator.id.toHex())
	let op = CopyrightOperator.load(id)

	if (op == null) {
		op = new CopyrightOperator(id)
		op.contract = contract.id
		op.owner = owner.id
		op.operator = operator.id
	}

	return op
}

export function fetchCopyrightProvanance(fromTokenId: string, toTokenId: string): CopyrightProvanance {
  let id = fromTokenId.concat('/').concat(toTokenId)
  let provanance = CopyrightProvanance.load(id)
  if (provanance == null) {
    provanance = new CopyrightProvanance(id)
    provanance.fromToken = fromTokenId
    provanance.toToken = toTokenId
  }

  return provanance
}
