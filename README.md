# `solidity-abi-graphs`

Turn Solidity compiler artifacts (from e.g. Truffle) into graph objects.
Uses `graphlib` under the hood to make use of their lovely algorithms.

Currently parses functions (including the constructor) and their inputs/outputs from a single a contract.
Ignores events and fallbacks.

## Installation

```sh
npm install solidity-abi-graphs
```

## Usage

```js
import { ContractGraph } from 'solidity-abi-graphs'

// ...

const graph = new ContractGraph(artifact, options)
```

## API

### ContractGraph

See `src/ContractGraph.js` for complete API.

#### `constructor(artifact, options)`

- `artifact` a compiled Solidity contract artifact, e.g. from `truffle`
- `options` an object with the following properties (defaults **bold**)
  - `constructorOnly` `true` if you only need constructor nodes, **`false`** otherwise
  - `graphlib` `true` if you want to maintain a graphlib representation, **`false`** otherwise
  - `id` some truthy string if you want a custom id, otherwise **`null`** to use default (`uuid/v4`)
