/*
 * File: ast-tree-v15.test.mjs
 * Modification: 2026-10-11 — AST Tree projection and editor source offsets (test-first).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectAstTree, editorOffset} from '../lib/ast-tree.ts';
const range=(start,end)=>({start:{line:1,column:start+1,offset:start},end:{line:1,column:end+1,offset:end}});
const text=(value,s,e)=>({type:'text',value,range:range(s,e)});

test('AST Tree projects headings, nested lists and inline nodes with source spans',()=>{
 const document={type:'document',version:'1.1',metadata:{},diagnostics:[],children:[
  {type:'heading',level:1,id:'intro',range:range(0,9),children:[text('Intro',3,8)]},
  {type:'list',ordered:false,automatic:false,start:null,range:range(10,21),items:[
   {type:'listItem',task:null,range:range(10,21),children:[{type:'paragraph',range:range(11,21),children:[{type:'strong',attrs:{},children:[text('Bold',13,17)],range:range(11,19)}]}]}
  ]}
 ]};
 const projected=projectAstTree(document);
 assert.equal(projected.label,'Document');
 assert.equal(projected.children[0].label,'Heading · H1');
 assert.deepEqual(projected.children[0].range,range(0,9));
 assert.equal(projected.children[1].children[0].label,'List item');
 assert.equal(projected.children[1].children[0].children[0].children[0].label,'Strong');
});

test('AST Tree respects maxNodes and inserts a truncation marker',()=>{
 const document={type:'document',version:'1.1',metadata:{},diagnostics:[],children:Array.from({length:200},(_,i)=>({type:'paragraph',range:range(i,i+1),children:[text('x',i,i+1)]}))};
 const projected=projectAstTree(document,{maxNodes:20});
 assert.ok(JSON.stringify(projected).includes('remaining nodes omitted'));
 assert.ok(projected.children.length<=21);
});

test('editorOffset maps line-column locations safely and prefers range offsets',()=>{
 assert.equal(editorOffset('alpha\nbeta\n',{line:2,column:3}),8);
 assert.equal(editorOffset('alpha\nbeta',{line:8,column:99}),10);
 assert.equal(editorOffset('A😀B',{line:1,column:3,offset:2}),2);
});
