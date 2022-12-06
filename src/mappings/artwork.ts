import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import {
  ApprovalForAll,
  BurnCall,
  CopyCall,
  TransferBatch,
  TransferSingle,
  URI,
} from "../../generated/Artwork/IArtwork"
import { Account, ArtworkContract, ArtworkTransfer } from "../../generated/schema"
import { fetchAccount } from "../helpers/account"
import { fetchArtworkBalance, fetchArtworkContract, fetchArtworkOperator, fetchArtworkToken } from "../helpers/artwork"
import { events, transactions } from "../helpers/common"

///////////////////////////////////////////////////////////////////////////////
//                                Call Handlers                              //
///////////////////////////////////////////////////////////////////////////////

export function handleCall(call: CopyCall): void {
  let contract = fetchArtworkContract(call.to)
  let token = fetchArtworkToken(contract, call.inputs.tokenId)
  let owner = fetchAccount(call.inputs.account)
  let ownerBalance = fetchArtworkBalance(token, owner)
  let amount = call.inputs.amount

  token.ownedSupply.plus(amount)
  ownerBalance.ownedValue.plus(amount)

  token.save()
  ownerBalance.save()
}

export function handlerBurn(call: BurnCall): void {
  let contract = fetchArtworkContract(call.to)
  let token = fetchArtworkToken(contract, call.inputs.tokenId)
  let owner = fetchAccount(call.inputs.account)
  let ownerBalance = fetchArtworkBalance(token, owner)
  let amount = call.inputs.amount

  token.ownedSupply.minus(amount)
  ownerBalance.ownedValue.minus(amount)

  token.save()
  ownerBalance.save()
}


///////////////////////////////////////////////////////////////////////////////
//                                Event Handlers                             //
///////////////////////////////////////////////////////////////////////////////

export function handleApprovalForAll(event: ApprovalForAll): void {
  let contract = fetchArtworkContract(event.address)
	let owner = fetchAccount(event.params.account)
	let operator = fetchAccount(event.params.operator)
	let delegation = fetchArtworkOperator(contract, owner, operator)
	delegation.approved = event.params.approved
	delegation.save()
}

export function handleTransferBatch(event: TransferBatch): void {
  let contract = fetchArtworkContract(event.address)
	let operator = fetchAccount(event.params.operator)
	let from = fetchAccount(event.params.from)
	let to = fetchAccount(event.params.to)

	let ids = event.params.ids
	let values = event.params.values

	// If this equality doesn't hold (some devs actually don't follox the ERC specifications) then we just can't make
	// sens of what is happening. Don't try to make something out of stupid code, and just throw the event. This
	// contract doesn't follow the standard anyway.
	if (ids.length == values.length) {
		for (let i = 0;  i < ids.length; ++i) {
			registerTransfer(
				event,
				"/".concat(i.toString()),
				contract,
				operator,
				from,
				to,
				ids[i],
				values[i]
			)
		}
	}
}

export function handleTransferSingle(event: TransferSingle): void {
  let contract = fetchArtworkContract(event.address)
	let operator = fetchAccount(event.params.operator)
	let from = fetchAccount(event.params.from)
	let to = fetchAccount(event.params.to)

	registerTransfer(
		event,
		"",
		contract,
		operator,
		from,
		to,
		event.params.id,
		event.params.value
	)
}

function registerTransfer(
	event: ethereum.Event,
	suffix: string,
	contract: ArtworkContract,
	operator: Account,
	from: Account,
	to: Account,
	id: BigInt,
	value: BigInt)
: void
{
	let token = fetchArtworkToken(contract, id)
	let ev = new ArtworkTransfer(events.id(event).concat(suffix))
	ev.emitter = token.contract
	ev.transaction = transactions.log(event).id
	ev.timestamp = event.block.timestamp
	ev.contract = contract.id
	ev.token = token.id
	ev.operator = operator.id
	ev.value = value

	if (from.id == Address.zero()) {
    token.totalSupply.plus(value)
    token.usedSupply = token.ownedSupply.minus(token.totalSupply)
	} else {
		let balance = fetchArtworkBalance(token, from)
		balance.value = balance.value.minus(value)
    balance.usedValue = balance.ownedValue.minus(balance.value)
		balance.save()

		ev.from = from.id
		ev.fromBalance = balance.id
	}

	if (to.id == Address.zero()) {
    token.totalSupply.minus(value)
    token.usedSupply = token.ownedSupply.minus(token.totalSupply)
	} else {
		let balance = fetchArtworkBalance(token, to)
		balance.value = balance.value.plus(value)
    balance.usedValue = balance.ownedValue.minus(balance.value)
		balance.save()

		ev.to = to.id
		ev.toBalance = balance.id
	}

	token.save()
	ev.save()
}
