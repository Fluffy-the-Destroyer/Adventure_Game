export class variables {
  vars: Map<string, number> = new Map();
  add(this: variables, varChanges: variables): void {
    for (let [name, value] of Object.entries(varChanges.vars)) {
      this.vars.set(name, (this.vars.get(name) ?? 0) + value);
    }
  }
  reset(this: variables): void {
    this.vars = new Map();
  }
}
