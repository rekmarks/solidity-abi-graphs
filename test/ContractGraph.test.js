
/* eslint-env jest */

import { contracts } from 'chain-end'

import { ContractGraph } from '../index'

const _gsDefaultMock = {
  id: expect.any(String),
  contractName: null,
  options: expect.any(Object),
  nodes: {
    ids: expect.any(Object),
    names: expect.any(Object),
    constructorId: expect.any(String),
    functionIds: expect.any(Array),
  },
  edges: {
    ids: expect.any(Object),
    names: expect.any(Object),
  },
  Graph: null,
}

describe('ContractGraph', () => {

  it('constructor instantiates object with expected properties', () => {

    let g = new ContractGraph(contracts.BurnableMintableERC20)

    const mock = {
      ..._gsDefaultMock,
      contractName: 'BurnableMintableERC20',
    }

    expect(g._gs).toMatchObject(mock)

    g = new ContractGraph(contracts.BurnableMintableERC20, { graphlib: true })
    expect(g._gs).toMatchObject({
      ...mock,
      Graph: expect.any(Object),
    })
  })
})
