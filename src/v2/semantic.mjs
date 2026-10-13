/* Deterministic semantic projection without positional metadata. */
export function normalizeSemantic(document){
  function normalize(node){
    if(node.type==='text')return {type:'text',text:node.text};
    if(node.type==='heading')return {type:'heading',level:node.level,text:node.text,id:node.id};
    if(node.type!=='directive')throw new TypeError(`Unsupported semantic node: ${node.type}`);
    const attributes=Object.fromEntries(Object.entries(node.attributes).sort(([a],[b])=>a.localeCompare(b,'en')));
    const result={type:'directive',name:node.name,mode:node.mode,attributes};
    if(node.mode==='normal')result.children=node.children.map(normalize);
    else if(node.mode==='table')result.rows=node.rows.map(row=>[...row]);
    else if(node.mode==='raw')result.raw=[...node.raw];
    else if(node.mode==='data'){
      if(node.dataError)throw new TypeError('Cannot normalize invalid data block');
      result.data=node.data;
    }
    return result;
  }
  return {nodes:document.nodes.map(normalize)};
}
