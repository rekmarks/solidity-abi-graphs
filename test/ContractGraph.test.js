
/* eslint-env jest */

import { contracts } from 'chain-end'

import { ContractGraph } from '../index'

const _gsDefaultMock = {
  id: expect.any(String),
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

    let g = new ContractGraph(contracts.BurnableMintableERC20)

    const mock = {
      ..._gsDefaultMock,
      contractName: 'BurnableMintableERC20',
      functionNodes: expect.any(Array),
      constructorNodeId: expect.any(String),
    }

    expect(g._gs).toMatchObject(mock)

    g = new ContractGraph(contracts.BurnableMintableERC20, { graphlib: true })
    expect(g._gs).toMatchObject({
      ...mock,
      Graph: expect.any(Object),
    })
  })
})
