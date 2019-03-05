"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var _objectSpread2=_interopRequireDefault(require("@babel/runtime/helpers/objectSpread")),_classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck")),_defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty")),_typeof2=_interopRequireDefault(require("@babel/runtime/helpers/typeof")),_graphlib=require("graphlib"),_v=_interopRequireDefault(require("uuid/v4")),graphlibOptions={directed:!0,compound:!0,multigraph:!1},defaultOptions={constructorOnly:!1,graphlib:!1,id:null/**
 * Validates options passed to ContractGraph constructor. Throws on error.
 * @param {object} options the constructor options
 */};function validateOptions(a){if(!a||"object"!==(0,_typeof2.default)(a))throw new Error("Invalid options")}/**
 * Validates a Solidity compilation artifact for parsing into a graph.
 * @param {object} a the artifact
 */function validateArtifact(b){// must have contractName and abi properties
if(!b)throw new Error("Invalid artifact: Falsy.");if(!b.contractName)throw new Error("Invalid artifact: Falsy contract name");if(!b.abi||1>b.abi.length)throw new Error("Invalid artifact: Invalid abi");// must only have one constructor
if(1!==b.abi.filter(function(a){return"constructor"===a.type}).length)throw new Error("Parsing failure: Invalid abi (no or multiple constructors)");// abi entities must have valid types
b.abi.forEach(function(a){if(!["constructor","function","event"].includes(a.type))throw new Error("Parsing failure: Invalid abi entity type \""+a.type+"\" for entry: "+JSON.stringify(a))})}/**
 *
 */var ContractGraph=/**
   * Parses artifact and creates graph after validating artifact and options.
   * @param {object} artifact the Solidity compilation artifact to represent
   * @param {object} options optional options
   */function a(b){var c=this,d=1<arguments.length&&arguments[1]!==void 0?arguments[1]:{};(0,_classCallCheck2.default)(this,a),(0,_defineProperty2.default)(this,"id",function(){return c._gs.id}),(0,_defineProperty2.default)(this,"options",function(){return(0,_objectSpread2.default)({},c._gs.options)}),(0,_defineProperty2.default)(this,"constructorOnly",function(){return c._gs.options.constructorOnly}),(0,_defineProperty2.default)(this,"usesGraphlib",function(){return c._gs.options.graphlib}),(0,_defineProperty2.default)(this,"contractName",function(){return c._gs.contractName}),(0,_defineProperty2.default)(this,"constructorNode",function(){return(0,_objectSpread2.default)({},c._gs.nodes.ids[c._gs.constructorNodeId])}),(0,_defineProperty2.default)(this,"nodeById",function(a){return(0,_objectSpread2.default)({},c._gs.nodes.ids[a])}),(0,_defineProperty2.default)(this,"nodeByName",function(a){return(0,_objectSpread2.default)({},c._gs.nodes.names[a])}),validateOptions(d),validateArtifact(b),this._gs={id:d.id||(0,_v.default)(),edges:{ids:{},names:{}},nodes:{ids:{},names:{}},options:(0,_objectSpread2.default)({},defaultOptions,d)},this._gs.options.graphlib&&(this._gs.Graph=new _graphlib.Graph(graphlibOptions)),parseContract(b,this)}/**
   * Get the id of this graph.
   */ // getEdge = (source, target) => this._gs.edges[source + ':' + target]
;/**
 * Parses the artifact a into the ContractGraph g.
 * @param {object} a the artifact to parse
 * @param {object} g the ContractGraph that will represent the artifact
 */exports.default=ContractGraph;function parseContract(b,a){a._gs.contractName=b.contractName,b.abi.forEach(function(b){if("event"!==b.type&&(// ignore events for now
"constructor"===b.type||// ignore function nodes if this is a constructor-only graph
"function"===b.type&&!a.constructorOnly())){var c=(0,_v.default)(),d={id:c,nodeType:b.type,name:b.name||"constructor",payable:b.payable};b.inputs&&(d.inputs=[],b.inputs.forEach(function(b,e){var f=(0,_v.default)();addChild(b,f,c,"input",a,e),d.inputs.push(f)})),b.outputs&&(d.outputs=[],b.outputs.forEach(function(b){var e=(0,_v.default)();addChild(b,e,c,"output",a),d.outputs.push(e)})),a.usesGraphlib()&&a._gs.Graph.setNode(c,d.name),"constructor"===b.type?a._gs.constructorNodeId=c:"function"===b.type&&(!a._gs.functionNodes&&(a._gs.functionNodes=[]),a._gs.functionNodes.push(d)),a._gs.nodes.ids[c]=d,a._gs.nodes.names[d.name]=c}})}function addChild(a,b,c,d,e){var f=5<arguments.length&&void 0!==arguments[5]?arguments[5]:null,g={childId:b,nodeType:d,parent:c,name:a.name,dataType:a.type};return null!==f&&(g.order=f),e.usesGraphlib()&&e._gs.Graph.setParent(b,c),e._gs.nodes.ids[b]=g,b}
//# sourceMappingURL=ContractGraph.js.map