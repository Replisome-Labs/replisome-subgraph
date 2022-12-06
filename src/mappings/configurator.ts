import {
  FeeTokenUpdated,
  FeeUpdated,
  OwnerUpdated,
  TreaturyUpdated
} from "../../generated/Configurator/Configurator"
import { fetchConfigurator, fetchFeeFormula } from "../helpers/configurator"


export function handleFeeTokenUpdated(event: FeeTokenUpdated): void {
  let configurator = fetchConfigurator(event.address)
  configurator.feeToken = event.params.token
  configurator.save()
}

export function handleFeeUpdated(event: FeeUpdated): void {
  let configurator = fetchConfigurator(event.address)
  let feeFormula = fetchFeeFormula(configurator, event.params.action)
  feeFormula.value = event.params.feeFormula
  feeFormula.save()
}

export function handleOwnerUpdated(event: OwnerUpdated): void {
  let configurator = fetchConfigurator(event.address)
  configurator.owner = event.params.newOwner
  configurator.save()
}

export function handleTreaturyUpdated(event: TreaturyUpdated): void {
  let configurator = fetchConfigurator(event.address)
  configurator.treatury = event.params.vault
  configurator.save()
}
