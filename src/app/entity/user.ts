import {Userstatus} from "./userstatus";
import {Role} from "./role";

export class User {
  public id !: number;
  public username !: string;
  public password !: string;
  public roles !: Role[];

  [key: string]: any; // Index signature to allow accessing properties dynamically

  constructor(id:number, username:string, password: string, roles: Role[]) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.roles = roles;

  }
}

/*loginlogin - loginlogin -> admin

 */
