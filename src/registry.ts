export type DirectiveKind = "inline" | "block" | "rawBlock";
export interface DirectiveDefinition {
  readonly name: string;
  readonly kind: DirectiveKind;
  readonly attributes?: readonly string[];
}

export interface DirectiveAttributeDiagnostic {
  readonly key: string;
  readonly message: string;
}

export class DirectiveRegistry {
  private readonly definitions = new Map<string, DirectiveDefinition>();
  register(definition: DirectiveDefinition): this {
    if (!/^[a-z][a-z\d_]*(?::[a-z][a-z\d_]*)*$/.test(definition.name)) {
      throw new Error(`Invalid directive name: ${definition.name}`);
    }
    if (this.definitions.has(definition.name)) throw new Error(`Duplicate directive: ${definition.name}`);
    this.definitions.set(definition.name, Object.freeze({...definition}));
    return this;
  }
  get(name: string): DirectiveDefinition | undefined { return this.definitions.get(name); }
  has(name: string, kind?: DirectiveKind): boolean {
    const definition = this.get(name);
    return !!definition && (kind === undefined || definition.kind === kind);
  }
  entries(): readonly DirectiveDefinition[] { return [...this.definitions.values()]; }
  validateAttributes(name: string, attributes: Readonly<Record<string, unknown>>): readonly DirectiveAttributeDiagnostic[] {
    const definition = this.get(name);
    if (!definition?.attributes) return [];
    const allowed = new Set(["id", "class", ...definition.attributes]);
    return Object.keys(attributes).filter(key => !allowed.has(key)).map(key => ({key, message: `@${name} 不接受屬性：${key}`}));
  }
}

export function getDefaultDirectiveRegistry(): DirectiveRegistry {
  return new DirectiveRegistry()
    .register({name: "kbd", kind: "inline", attributes: ["title"]})
    .register({name: "abbr", kind: "inline", attributes: ["title"]})
    .register({name: "term", kind: "inline"})
    .register({name: "var", kind: "inline"})
    .register({name: "lang", kind: "inline", attributes: ["code"]})
    .register({name: "ref", kind: "inline"})
    .register({name: "note", kind: "block", attributes: ["title"]})
    .register({name: "tip", kind: "block"})
    .register({name: "important", kind: "block"})
    .register({name: "warning", kind: "block"})
    .register({name: "caution", kind: "block"})
    .register({name: "quote", kind: "block"})
    .register({name: "example", kind: "block"})
    .register({name: "figure", kind: "block"})
    .register({name: "details", kind: "block"})
    .register({name: "definition", kind: "block"})
    .register({name: "theorem", kind: "block"})
    .register({name: "lemma", kind: "block"})
    .register({name: "proof", kind: "block"})
    .register({name: "abstract", kind: "block"})
    .register({name: "appendix", kind: "block"})
    .register({name: "table", kind: "rawBlock", attributes: ["format"]})
    .register({name: "data", kind: "rawBlock", attributes: ["format"]})
    .register({name: "raw", kind: "rawBlock"})
    .register({name: "equation", kind: "rawBlock"});
}
