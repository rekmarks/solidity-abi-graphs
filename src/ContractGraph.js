
import { Graph } from 'graphlib'

import uuidv4 from 'uuid/v4'

const graphlibOptions = { directed: true, compound: true, multigraph: false }

const defaultOptions = {
  // whether the graph only contains the constructor node
  constructorOnly: false,
  // whether the graph should maintain a graphlib representation of itself
  graphlib: false,
  // if not falsy, the graph will use this id
  id: null,
}

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
    if (![
      'constructor', 'function', 'event', 'fallback',
    ].includes(entry.type)) {
      throw new Error(
        'Parsing failure: Invalid abi entity type "' + entry.type +
        '" for entry: ' + JSON.stringify(entry)
      )
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
      contractName: null,
      options: {
        ...defaultOptions,
        ...options,
      },
      nodes: {
        ids: {},
        names: {},
        functionIds: [],
        constructorId: null,
      },
      edges: {
        ids: {},
        names: {},
      },
    }
    this._gs.options.graphlib
    ? this._gs.Graph = new Graph(graphlibOptions)
    : this._gs.Graph = null

    parseContract(artifact, this)

    // parsingpost-validation
    if (!this.constructorNodeId()) {
      throw new Error('Contract missing constructor.')
    }
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
   * Get the internal graphlib graph, or null if !usesGraphlib.
   */
  graphlibGraph = () => this._gs.Graph

  /**
   * Get the name of the contract represented by this graph.
   */
  contractName = () => this._gs.contractName

  /**
   * Get the constructor node object of this graph.
   */
  constructorNode = () => {
    return {
      ...this._gs.nodes.ids[this._gs.nodes.constructorId],
    }
  }

  /**
   * Gets the id of the constructor node associated with this graph.
   */
  constructorNodeId = () => this._gs.nodes.constructorId

  /**
   * Gets an array of the function nodes associated with this graph.
   */
  functionNodes = () => {
    return Object.values(this._gs.nodes.functionIds).map(
      id => this.nodeById(id))
  }

  /**
   * Gets an array of the function node ids associated with this graph.
   */
  functionNodeIds = () => this._gs.nodes.functionIds

  /**
   * Get the node with the given id.
   */
  nodeById = id => {
    return (
      this._gs.nodes.ids[id]
      ? { ...this._gs.nodes.ids[id] }
      : null
    )
  }

  /**
   * Get the node with the given name.
   */
  nodeByName = name => {
    return (
      this._gs.nodes.names[name]
      ? this.nodeById(this._gs.nodes.names[name])
      : null
    )
  }

  /**
   * Get an array of the input nodes of the node with id.
   */
  inputNodes = id => {
    if (!this.nodeById(id)) return null
    return (
      !this.nodeById(id).inputs
      ? []
      : Object.values(this.nodeById(id).inputs).map(
        id => this.nodeById(id)
      )
    )
  }

  /**
   * Get an array of the output nodes of the node with id.
   */
  outputNodes = id => {
    if (!this.nodeById(id)) return null
    return (
      !this.nodeById(id).outputs
      ? []
      : Object.values(this.nodeById(id).outputs).map(
        id => this.nodeById(id)
      )
    )
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

    if ( // only handle constructor and function nodes
      entry.type === 'constructor' ||
      // ignore function nodes if this is a constructor-only graph
      (entry.type === 'function' && !g.constructorOnly())
    ) {

      // create node object
      const id = uuidv4()
      const node = {
        id,
        nodeType: entry.type,
        name: entry.name || 'constructor',
        payable: entry.payable,
      }

      // parse function inputs
      if (entry.inputs) {
        node.inputs = entry.inputs.map((input, i) => {
          const childId = uuidv4()
          addChild(input, childId, id, 'input', g, i)
          return childId
        })
      }

      // parse function outputs
      if (entry.outputs) {
        node.outputs = entry.outputs.map(output => {
          const childId = uuidv4()
          addChild(output, childId, id, 'output', g)
          return childId
        })
      }

      // add node to graphlib Graph
      if (g.usesGraphlib()) g._gs.Graph.setNode(id, node.name)

      // constructor and function-specific mappings
      if (entry.type === 'constructor') g._gs.nodes.constructorId = id
      else if (entry.type === 'function') {
        g._gs.nodes.functionIds.push(id)
      }

      g._gs.nodes.ids[id] = node
      g._gs.nodes.names[node.name] = id
    }
  })
}

/**
 * Adds an input or output node of parent with parentId to the graph g.
 * @param {object} entry the abi input/output entry
 * @param {string} id the id to use for this child node
 * @param {string} parentId the id of the parent node
 * @param {string} nodeType input or output
 * @param {object} g the ContractGraph
 * @param {number} i the abi index if an input (optional)
 */
function addChild (entry, id, parentId, nodeType, g, i = null) {

  const childNode = {
    id,
    nodeType,
    parentId,
    name: entry.name,
    solidityDataType: entry.type,
  }
  if (i) childNode.order = i

  if (g.usesGraphlib()) g._gs.Graph.setParent(id, parentId)

  g._gs.nodes.ids[id] = childNode

  return id
}
