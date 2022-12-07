import { constants } from "@amxx/graphprotocol-utils";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Configurator, FeeFormula } from "../../generated/schema";
import { actionTable, formatEntityId } from "./common";

export function fetchConfigurator(address: Address): Configurator {
  let configurator = Configurator.load(address);
  if (configurator == null) {
    configurator = new Configurator(address);
    configurator.owner = constants.ADDRESS_ZERO;
    configurator.treatury = constants.ADDRESS_ZERO;
    configurator.feeToken = constants.ADDRESS_ZERO;
  }
  return configurator;
}

export function fetchFeeFormula(
  configurator: Configurator,
  actionId: i32
): FeeFormula {
  let id = formatEntityId([configurator.id.toHex(), actionId.toString()]);
  let feeFormula = FeeFormula.load(id);
  if (feeFormula == null) {
    feeFormula = new FeeFormula(id);
    let action = actionTable.get(actionId);
    feeFormula.action = action ? action : "";
    feeFormula.configurator = configurator.id;
  }
  return feeFormula;
}
