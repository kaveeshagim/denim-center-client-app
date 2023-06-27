import {Userstatus} from "./userstatus";

export class User {
  public id !: number;
  public username !: string;
  public password !: string;
  public docreated !: string;
  public userstatus !: Userstatus;

  constructor(id:number, username:string, password: string, docreated: string, userstatus: Userstatus) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.docreated = docreated;
    this.userstatus = userstatus;
  }
}
