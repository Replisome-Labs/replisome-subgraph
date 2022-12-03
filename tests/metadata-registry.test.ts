import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { MetadataRegistryOwnerUpdated } from "../generated/schema"
import { MetadataRegistryOwnerUpdated as MetadataRegistryOwnerUpdatedEvent } from "../generated/MetadataRegistry/MetadataRegistry"
import { handleMetadataRegistryOwnerUpdated } from "../src/metadata-registry"
import { createMetadataRegistryOwnerUpdatedEvent } from "./metadata-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let newOwner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newMetadataRegistryOwnerUpdatedEvent = createMetadataRegistryOwnerUpdatedEvent(
      user,
      newOwner
    )
    handleMetadataRegistryOwnerUpdated(newMetadataRegistryOwnerUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("MetadataRegistryOwnerUpdated created and stored", () => {
    assert.entityCount("MetadataRegistryOwnerUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MetadataRegistryOwnerUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MetadataRegistryOwnerUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newOwner",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
