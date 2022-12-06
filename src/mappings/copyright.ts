import { Address, ethereum } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  PropertyRulesetUpdated,
  Transfer
} from "../../generated/Copyright/ICopyright"
import { CopyrightTransfer } from "../../generated/schema"
import { fetchAccount } from "../helpers/account"
import { events, transactions } from "../helpers/common"
import { fetchCopyrightContract, fetchCopyrightOperator, fetchCopyrightToken } from "../helpers/copyright"

export function handleApproval(event: Approval): void {
  let contract = fetchCopyrightContract(event.address)
	if (contract != null) {
		let token    = fetchCopyrightToken(contract, event.params.tokenId)
		let owner    = fetchAccount(event.params.owner)
		let approved = fetchAccount(event.params.approved)

		token.owner    = owner.id // this should not be necessary, owner changed is signaled by a transfer event
		token.approval = approved.id

		token.save()
		owner.save()
		approved.save()
	}
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let contract = fetchCopyrightContract(event.address)
	if (contract != null) {
		let owner      = fetchAccount(event.params.owner)
		let operator   = fetchAccount(event.params.operator)
		let delegation = fetchCopyrightOperator(contract, owner, operator)

		delegation.approved = event.params.approved

		delegation.save()
	}
}

export function handlePropertyRulesetUpdated(
  event: PropertyRulesetUpdated
): void {}

export function handleTransfer(event: Transfer): void {
  let contract = fetchCopyrightContract(event.address)
	if (contract != null) {
		let token = fetchCopyrightToken(contract, event.params.tokenId)
		let from  = fetchAccount(event.params.from)
		let to    = fetchAccount(event.params.to)

		token.owner    = to.id
		token.approval = fetchAccount(Address.zero()).id // implicit approval reset on transfer

		contract.save()
		token.save()

		let ev         = new CopyrightTransfer(events.id(event))
		ev.emitter     = contract.id
		ev.transaction = transactions.log(event).id
		ev.timestamp   = event.block.timestamp
		ev.contract    = contract.id
		ev.token       = token.id
		ev.from        = from.id
		ev.to          = to.id
		ev.save()
	}
}
