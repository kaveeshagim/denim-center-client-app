import {User} from "./user";
import {Role} from "./role";
import {Module} from "./module";

export class Privilege {
  public id !: number;
  public name !: string;
  public module !: Module;
  public role !: Role;

  constructor(id:number, name : string, module : Module, role : Role) {
    this.id = id;
    this.name = name;
    this.module = module;
    this.role = role;
  }
}
