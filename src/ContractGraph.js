
import { Graph } from 'graphlib'

import uuidv4 from 'uuid/v4'

const graphlibOptions = { directed: true, compound: true, multigraph: false }
const defaultOptions = { constructorOnly: false, graphlib: false }

/**
 * Validates options passed to ContractGraph constructor. Throws on error.
 * @param {object} options the constructor options
 */
function validateOptions (options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Invalid options')
  }
}

/**
 * Validates a Solidity compilation artifact for parsing into a graph.
 * @param {object} a the artifact
 */
function validateArtifact (a) {

  // must have contractName and abi properties
  if (!a) throw new Error('Invalid artifact: Falsy.')
  if (!a.contractName) throw new Error('Invalid artifact: Falsy contract name')
  if (!a.abi || a.abi.length < 1) {
    throw new Error('Invalid artifact: Invalid abi')
  }

  // must only have one constructor
  if (a.abi.filter(entry => entry.type === 'constructor').length !== 1) {
    throw new Error(
      'Parsing failure: Invalid abi (no or multiple constructors)'
    )
  }

  // abi entities must have valid types
  a.abi.forEach(entry => {
    if (!['constructor', 'function', 'event'].includes(entry.type)) {
      throw new Error('Parsing failure: Invalid abi (invalid entity type)')
    }
  })
}

/**
 *
 */
export default class ContractGraph {

  /**
   * Parses artifact and creates graph after validating artifact and options.
   * @param {object} artifact the Solidity compilation artifact to represent
   * @param {object} options optional options
   */
  constructor (artifact, options = {}) {
    validateOptions(options)
    validateArtifact(artifact)
    this._gs = {
      id: options.id || uuidv4(),
      edges: {
        ids: {},
        names: {},
      },
      nodes: {
        ids: {},
        names: {},
      },
      options: {
        ...defaultOptions,
        ...options,
      },
    }
    if (this._gs.options.graphlib) {
      this._gs.Graph = new Graph(graphlibOptions)
    }
    parseContract(artifact, this)
  }

  /**
   * Get the id of this graph.
   */
  id = () => this._gs.id

  /**
   * Get (a copy of) the options of this graph.
   */
  options = () => { return { ...this._gs.options } }

  /**
   * Get whether this graph only contains the constructor node.
   */
  constructorOnly = () => this._gs.options.constructorOnly

  /**
   * Get whether this graph uses graphlib.
   */
  usesGraphlib = () => this._gs.options.graphlib

  /**
   * Get the name of the contract represented by this graph.
   */
  contractName = () => this._gs.contractName

  /**
   * Get the constructor node object of this graph.
   */
  constructorNode = () => {
    return {
      ...this._gs.nodes.ids[this._gs.constructorNodeId],
    }
  }

  /**
   * Get the node with the given id.
   */
  nodeById = id => {
    return {
      ...this._gs.nodes.ids[id],
    }
  }

  /**
   * Get the node with the given name.
   */
  nodeByName = name => {
    return {
      ...this._gs.nodes.names[name],
    }
  }

  // getEdge = (source, target) => this._gs.edges[source + ':' + target]
}

/**
 * Parses the artifact a into the ContractGraph g.
 * @param {object} a the artifact to parse
 * @param {object} g the ContractGraph that will represent the artifact
 */
function parseContract (a, g) {

  g._gs.contractName = a.contractName

  a.abi.forEach(entry => {

    if (
      entry.type !== 'event' && // ignore events for now
      (
        entry.type === 'constructor' ||
        // ignore function nodes if this is a constructor-only graph
        (entry.type === 'function' && !g.constructorOnly())
      )
    ) {

      const id = uuidv4()
      const node = {
        id,
        nodeType: entry.type,
        name: entry.name || 'constructor',
        payable: entry.payable,
      }

      if (entry.inputs) {
        node.inputs = []
        entry.inputs.forEach((e, i) => {
          const childId = uuidv4()
          addChild(e, childId, id, 'input', g, i)
          node.inputs.push(childId)
        })
      }

      if (entry.outputs) {
        node.outputs = []
        entry.outputs.forEach(e => {
          const childId = uuidv4()
          addChild(e, childId, id, 'output', g)
          node.outputs.push(childId)
        })
      }

      if (g.usesGraphlib()) g._gs.Graph.setNode(id, node.name)

      if (entry.type === 'constructor') g._gs.constructorNodeId = id
      else if (entry.type === 'function') {
        if (!g._gs.functionNodes) g._gs.functionNodes = []
        g._gs.functionNodes.push(node)
      }

      g._gs.nodes.ids[id] = node
      g._gs.nodes.names[node.name] = id
    }
  })
}

function addChild (e, childId, parentId, nodeType, g, i = null) {

  const childNode = {
    childId,
    nodeType,
    parent: parentId,
    name: e.name,
    dataType: e.type,
  }
  if (i !== null) childNode.order = i

  if (g.usesGraphlib()) g._gs.Graph.setParent(childId, parentId)

  g._gs.nodes.ids[childId] = childNode

  return childId
}
