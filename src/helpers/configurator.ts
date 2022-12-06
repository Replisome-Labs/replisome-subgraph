import { constants } from "@amxx/graphprotocol-utils";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Configurator, FeeFormula } from "../../generated/schema";
import { actionTable } from "./common";

export function fetchConfigurator(address: Address): Configurator {
  let configurator = Configurator.load(address)
  if (configurator == null) {
    configurator = new Configurator(address)
    configurator.owner = constants.ADDRESS_ZERO
    configurator.treatury = constants.ADDRESS_ZERO
    configurator.feeToken = constants.ADDRESS_ZERO
  }
  return configurator
}

export function fetchFeeFormula(configurator: Configurator, actionId: BigInt): FeeFormula {
  let id = configurator.id.toHex().concat(actionId.toHex())
  let feeFormula = FeeFormula.load(id)
  if (feeFormula == null) {
    feeFormula = new FeeFormula(id)
    feeFormula.action = actionTable.get(actionId.toI32())
    feeFormula.configurator = configurator.id
  }
  return feeFormula
}
