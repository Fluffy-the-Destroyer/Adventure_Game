export class variables {
  vars: { [name: string]: number };
  constructor() {
    this.vars = Object.create(null);
  }
  add(this: variables, varChanges: variables): void {
    for (let [name, value] of Object.entries(varChanges.vars)) {
      if (Object.hasOwn(this.vars, name)) {
        this.vars[name] += value;
      } else {
        this.vars[name] = value;
      }
    }
  }
  reset(this: variables): void {
    this.vars = Object.create(null);
  }
}
