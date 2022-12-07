import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { ICopyright } from "../../generated/Copyright/ICopyright";
import {
  Account,
  CopyrightContract,
  CopyrightOperator,
  CopyrightProvanance,
  CopyrightToken,
  MetadataIngredient,
} from "../../generated/schema";
import { fetchAccount } from "./account";
import { fetchArtworkContract, fetchArtworkToken } from "./artwork";
import { formatEntityId, supportsInterface } from "./common";
import { fetchMetadataContract, fetchMetadataInfo } from "./metadata";

export function fetchCopyrightContract(address: Address): CopyrightContract {
  let copyright = ICopyright.bind(address);
  let contract = CopyrightContract.load(address);

  if (contract == null) {
    contract = new CopyrightContract(address);
    let try_name = copyright.try_name();
    let try_symbol = copyright.try_symbol();
    contract.name = try_name.reverted ? "" : try_name.value;
    contract.symbol = try_symbol.reverted ? "" : try_symbol.value;
    contract.save();
  }

  return contract;
}

export function fetchCopyrightToken(
  contract: CopyrightContract,
  identifier: BigInt
): CopyrightToken {
  let id = formatEntityId([contract.id.toHex(), identifier.toHex()]);
  let token = CopyrightToken.load(id);

  if (token == null) {
    let copyright = ICopyright.bind(Address.fromBytes(contract.id));
    let artworkAddress = copyright.artwork();
    let try_metadata = copyright.try_metadataOf(identifier);
    let try_creator = copyright.try_creatorOf(identifier);
    let try_ruleset = copyright.try_rulesetOf(identifier);
    let try_tokenURI = copyright.try_tokenURI(identifier);

    token = new CopyrightToken(id);
    token.contract = contract.id;
    token.identifier = identifier;
    token.approval = fetchAccount(Address.zero()).id;
    token.artwork = fetchArtworkToken(
      fetchArtworkContract(artworkAddress),
      identifier
    ).id;
    token.creator = fetchAccount(
      try_creator.reverted ? Address.zero() : try_creator.value
    ).id;
    token.ruleset = try_ruleset.reverted ? Address.zero() : try_ruleset.value;
    token.uri = try_tokenURI.reverted ? "" : try_tokenURI.value;

    if (try_metadata.reverted) {
      log.error("copyright do not have any metadata: {}", [
        identifier.toString(),
      ]);
      token.metadata = "";
    } else {
      let metadataInfo = fetchMetadataInfo(
        fetchMetadataContract(try_metadata.value.getMetadata()),
        try_metadata.value.getMetadataId()
      );
      token.metadata = metadataInfo.id;

      let ingredients = metadataInfo.ingredients;
      if (ingredients != null) {
        for (let i = 0; i < ingredients.length; i++) {
          let ingredient = MetadataIngredient.load(ingredients[i]);
          if (ingredient == null) continue;
          let provanance = fetchCopyrightProvanance(ingredient.token, id);
          provanance.amount = ingredient.amount;
          provanance.save();
        }
      }
    }
  }

  return token;
}

export function fetchCopyrightOperator(
  contract: CopyrightContract,
  owner: Account,
  operator: Account
): CopyrightOperator {
  let id = formatEntityId([
    contract.id.toHex(),
    owner.id.toHex(),
    operator.id.toHex(),
  ]);
  let op = CopyrightOperator.load(id);

  if (op == null) {
    op = new CopyrightOperator(id);
    op.contract = contract.id;
    op.owner = owner.id;
    op.operator = operator.id;
  }

  return op;
}

export function fetchCopyrightProvanance(
  fromTokenId: string,
  toTokenId: string
): CopyrightProvanance {
  let id = formatEntityId([fromTokenId, toTokenId]);
  let provanance = CopyrightProvanance.load(id);
  if (provanance == null) {
    provanance = new CopyrightProvanance(id);
    provanance.fromToken = fromTokenId;
    provanance.toToken = toTokenId;
  }

  return provanance;
}
