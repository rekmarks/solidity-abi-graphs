"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var _objectSpread2=_interopRequireDefault(require("@babel/runtime/helpers/objectSpread")),_classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck")),_defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty")),_typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof")),_graphlib=require("graphlib"),_v=_interopRequireDefault(require("uuid/v4")),graphlibOptions={directed:!0,compound:!0,multigraph:!1},defaultOptions={// whether the graph only contains the constructor node
constructorOnly:!1,// whether the graph should maintain a graphlib representation of itself
graphlib:!1,// if not falsy, the graph will use this id
id:null/**
 * Validates options passed to ContractGraph constructor. Throws on error.
 * @param {object} options the constructor options
 */};function validateOptions(a){if(!a||"object"!==(0,_typeof2.default)(a))throw new Error("Invalid options")}/**
 * Validates a Solidity compilation artifact for parsing into a graph.
 * @param {object} a the artifact
 */function validateArtifact(b){// must have contractName and abi properties
if(!b)throw new Error("Invalid artifact: Falsy.");if(!b.contractName)throw new Error("Invalid artifact: Falsy contract name");if(!b.abi||1>b.abi.length)throw new Error("Invalid artifact: Invalid abi");// must only have one constructor
if(1!==b.abi.filter(function(a){return"constructor"===a.type}).length)throw new Error("Parsing failure: Invalid abi (no or multiple constructors)");// abi entities must have valid types
b.abi.forEach(function(a){if(!["constructor","function","event","fallback"].includes(a.type))throw new Error("Parsing failure: Invalid abi entity type \""+a.type+"\" for entry: "+JSON.stringify(a))})}/**
 *
 */var ContractGraph=/**
   * Parses artifact and creates graph after validating artifact and options.
   * @param {object} artifact the Solidity compilation artifact to represent
   * @param {object} options optional options
   */function a(b){var c=this,d=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};// parsingpost-validation
if((0,_classCallCheck2.default)(this,a),(0,_defineProperty2.default)(this,"id",function(){return c._gs.id}),(0,_defineProperty2.default)(this,"options",function(){return(0,_objectSpread2.default)({},c._gs.options)}),(0,_defineProperty2.default)(this,"constructorOnly",function(){return c._gs.options.constructorOnly}),(0,_defineProperty2.default)(this,"usesGraphlib",function(){return c._gs.options.graphlib}),(0,_defineProperty2.default)(this,"graphlibGraph",function(){return c._gs.Graph}),(0,_defineProperty2.default)(this,"contractName",function(){return c._gs.contractName}),(0,_defineProperty2.default)(this,"constructorNode",function(){return(0,_objectSpread2.default)({},c._gs.nodes.ids[c._gs.nodes.constructorId])}),(0,_defineProperty2.default)(this,"constructorNodeId",function(){return c._gs.nodes.constructorId}),(0,_defineProperty2.default)(this,"functionNodes",function(){return Object.values(c._gs.nodes.functionIds).map(function(a){return c.nodeById(a)})}),(0,_defineProperty2.default)(this,"functionNodeIds",function(){return c._gs.nodes.functionIds}),(0,_defineProperty2.default)(this,"nodeById",function(a){return c._gs.nodes.ids[a]?(0,_objectSpread2.default)({},c._gs.nodes.ids[a]):null}),(0,_defineProperty2.default)(this,"nodeByName",function(a){return c._gs.nodes.names[a]?c.nodeById(c._gs.nodes.names[a]):null}),(0,_defineProperty2.default)(this,"inputNodes",function(a){return c.nodeById(a)?c.nodeById(a).inputs?Object.values(c.nodeById(a).inputs).map(function(a){return c.nodeById(a)}):[]:null}),(0,_defineProperty2.default)(this,"outputNodes",function(a){return c.nodeById(a)?c.nodeById(a).outputs?Object.values(c.nodeById(a).outputs).map(function(a){return c.nodeById(a)}):[]:null}),validateOptions(d),validateArtifact(b),this._gs={id:d.id||(0,_v.default)(),contractName:null,options:(0,_objectSpread2.default)({},defaultOptions,d),nodes:{ids:{},names:{},functionIds:[],constructorId:null},edges:{ids:{},names:{}}},this._gs.Graph=this._gs.options.graphlib?new _graphlib.Graph(graphlibOptions):null,parseContract(b,this),!this.constructorNodeId())throw new Error("Contract missing constructor.")}/**
   * Get the id of this graph.
   */ // getEdge = (source, target) => this._gs.edges[source + ':' + target]
;/**
 * Parses the artifact a into the ContractGraph g.
 * @param {object} a the artifact to parse
 * @param {object} g the ContractGraph that will represent the artifact
 */exports.default=ContractGraph;function parseContract(b,a){a._gs.contractName=b.contractName,b.abi.forEach(function(b){if(// only handle constructor and function nodes
"constructor"===b.type||// ignore function nodes if this is a constructor-only graph
"function"===b.type&&!a.constructorOnly()){// create node object
var c=(0,_v.default)(),d={id:c,nodeType:b.type,name:b.name||"constructor",payable:b.payable// parse function inputs
};b.inputs&&(d.inputs=b.inputs.map(function(b,d){var e=(0,_v.default)();return addChild(b,e,c,"input",a,d),e})),b.outputs&&(d.outputs=b.outputs.map(function(b){var d=(0,_v.default)();return addChild(b,d,c,"output",a),d})),a.usesGraphlib()&&a._gs.Graph.setNode(c,d.name),"constructor"===b.type?a._gs.nodes.constructorId=c:"function"===b.type&&a._gs.nodes.functionIds.push(c),a._gs.nodes.ids[c]=d,a._gs.nodes.names[d.name]=c}})}/**
 * Adds an input or output node of parent with parentId to the graph g.
 * @param {object} entry the abi input/output entry
 * @param {string} id the id to use for this child node
 * @param {string} parentId the id of the parent node
 * @param {string} nodeType input or output
 * @param {object} g the ContractGraph
 * @param {number} i the abi index if an input (optional)
 */function addChild(a,b,c,d,e){var f=5<arguments.length&&void 0!==arguments[5]?arguments[5]:null,g={id:b,nodeType:d,parentId:c,name:a.name,solidityDataType:a.type};return f&&(g.order=f),e.usesGraphlib()&&e._gs.Graph.setParent(b,c),e._gs.nodes.ids[b]=g,b}
//# sourceMappingURL=ContractGraph.js.map