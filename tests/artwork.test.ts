import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { ArtworkApprovalForAll } from "../generated/schema"
import { ArtworkApprovalForAll as ArtworkApprovalForAllEvent } from "../generated/Artwork/Artwork"
import { handleArtworkApprovalForAll } from "../src/artwork"
import { createArtworkApprovalForAllEvent } from "./artwork-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let account = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let operator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let approved = "boolean Not implemented"
    let newArtworkApprovalForAllEvent = createArtworkApprovalForAllEvent(
      account,
      operator,
      approved
    )
    handleArtworkApprovalForAll(newArtworkApprovalForAllEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ArtworkApprovalForAll created and stored", () => {
    assert.entityCount("ArtworkApprovalForAll", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ArtworkApprovalForAll",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "account",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ArtworkApprovalForAll",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "operator",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ArtworkApprovalForAll",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "approved",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
