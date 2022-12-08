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
import { IMetadata } from "../../generated/templates/Metadata/IMetadata";
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
      metadataInfo.copyright = token.id;
      metadataInfo.save();

      token.metadata = metadataInfo.id;

      let metadata = IMetadata.bind(Address.fromBytes(metadataInfo.contract));
      let try_getIngredients = metadata.try_getIngredients(
        metadataInfo.identifier
      );
      if (!try_getIngredients.reverted) {
        let ingredientsResult = try_getIngredients.value;
        let ids = ingredientsResult.getIds();
        let amounts = ingredientsResult.getAmounts();
        for (let i = 0; i < ids.length; i++) {
          let provanance = fetchCopyrightProvanance(
            fetchCopyrightToken(contract, ids[i]),
            token
          );
          provanance.amount = amounts[i];
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
  fromToken: CopyrightToken,
  toToken: CopyrightToken
): CopyrightProvanance {
  let id = formatEntityId([fromToken.id, toToken.identifier.toHex()]);
  let provanance = CopyrightProvanance.load(id);
  if (provanance == null) {
    provanance = new CopyrightProvanance(id);
    provanance.fromToken = fromToken.id;
    provanance.toToken = toToken.id;
  }

  return provanance;
}
