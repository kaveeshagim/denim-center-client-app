import {User} from "./user";
import {Role} from "./role";

export class Userrole {
  public id !: number;
  public user !: User;
  public role !: Role;

  constructor(id:number, user : User, role : Role) {
    this.id = id;
    this.user = user;
    this.role = role;
  }
}
