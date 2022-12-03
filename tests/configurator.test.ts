import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { CopyrightRendererUpdated } from "../generated/schema"
import { CopyrightRendererUpdated as CopyrightRendererUpdatedEvent } from "../generated/Configurator/Configurator"
import { handleCopyrightRendererUpdated } from "../src/configurator"
import { createCopyrightRendererUpdatedEvent } from "./configurator-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let renderer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newCopyrightRendererUpdatedEvent = createCopyrightRendererUpdatedEvent(
      renderer
    )
    handleCopyrightRendererUpdated(newCopyrightRendererUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CopyrightRendererUpdated created and stored", () => {
    assert.entityCount("CopyrightRendererUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CopyrightRendererUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "renderer",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
