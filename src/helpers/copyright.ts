import { constants } from "@amxx/graphprotocol-utils";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Copyright } from "../../generated/Copyright/Copyright";
import { IRuleset } from "../../generated/Copyright/IRuleset";
import {
  Account,
  CopyrightContract,
  CopyrightOperator,
  CopyrightProvanance,
  CopyrightToken,
  Ruleset,
} from "../../generated/schema";
import { fetchAccount } from "./account";
import { fetchArtworkContract, fetchArtworkToken } from "./artwork";
import { formatEntityId } from "./common";
import { fetchMetadataContract, fetchMetadataInfo } from "./metadata";

export function fetchCopyrightContract(address: Address): CopyrightContract {
  let copyright = Copyright.bind(address);
  let contract = CopyrightContract.load(address);

  if (contract == null) {
    contract = new CopyrightContract(address);
    let try_name = copyright.try_name();
    let try_symbol = copyright.try_symbol();
    contract.name = try_name.reverted ? "" : try_name.value;
    contract.symbol = try_symbol.reverted ? "" : try_symbol.value;
    contract.totalSupply = constants.BIGINT_ZERO;
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
    let copyright = Copyright.bind(Address.fromBytes(contract.id));
    let artworkAddress = copyright.artwork();
    let try_metadata = copyright.try_metadataOf(identifier);
    let try_creator = copyright.try_creatorOf(identifier);
    let try_ruleset = copyright.try_rulesetOf(identifier);
    let try_tokenURI = copyright.try_tokenURI(identifier);
    let try_getIngredients = copyright.try_getIngredients(identifier);

    token = new CopyrightToken(id);
    token.contract = contract.id;
    token.identifier = identifier;
    token.owner = fetchAccount(Address.zero()).id;
    token.approval = fetchAccount(Address.zero()).id;
    token.creator = fetchAccount(
      try_creator.reverted ? Address.zero() : try_creator.value
    ).id;
    token.ruleset = fetchRuleset(
      try_ruleset.reverted ? Address.zero() : try_ruleset.value
    ).id;
    token.uri = try_tokenURI.reverted ? "" : try_tokenURI.value;

    let artwork = fetchArtworkToken(
      fetchArtworkContract(artworkAddress),
      identifier
    );
    artwork.copyright = id;
    artwork.save();

    token.artwork = artwork.id;

    token.metadata = "";
    if (!try_metadata.reverted) {
      let metadataInfo = fetchMetadataInfo(
        fetchMetadataContract(try_metadata.value.getMetadata()),
        try_metadata.value.getMetadataId()
      );
      metadataInfo.copyright = id;
      metadataInfo.save();

      token.metadata = metadataInfo.id;
    }

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

export function fetchRuleset(address: Address): Ruleset {
  let ruleset = IRuleset.bind(address);
  let contract = Ruleset.load(address);

  if (contract == null) {
    contract = new Ruleset(address);
    let try_isUpgradable = ruleset.try_isUpgradable();
    contract.isUpgradable = try_isUpgradable.reverted
      ? false
      : try_isUpgradable.value;
    contract.save();
  }

  return contract;
}
