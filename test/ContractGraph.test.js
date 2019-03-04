
/* eslint-env jest */

import { contracts } from 'chain-end'

import { ContractGraph } from '../index'

const _gsMock = {
  id: expect.any(String),
  Graph: expect.any(Object),
  edges: {
    ids: expect.any(Object),
    names: expect.any(Object),
  },
  nodes: {
    ids: expect.any(Object),
    names: expect.any(Object),
  },
  options: expect.any(Object),
}

describe('ContractGraph', () => {

  it('constructor instantiates object with expected properties', () => {

    const g = new ContractGraph(contracts.BurnableMintableERC20)

    expect(g._gs).toMatchObject({
      ..._gsMock,
      contractName: 'BurnableMintableERC20',
      functionNodes: expect.any(Array),
      constructorNodeId: expect.any(String),
    })
  })
})
