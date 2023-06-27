
import {Material} from "./material";

export class Materialinventory {
  public id !: number;
  public number !: string;
  public qty !: number;
  public updateddate !: string;
  public reorderlevel !: number;
  public material !: Material;

  constructor(id:number,  number : string, qty : number, updateddate : string, reorderlevel : number, material : Material) {
    this.id = id;
    this.number = number;
    this.qty = qty;
    this.updateddate = updateddate;
    this.reorderlevel = reorderlevel;
    this.material = material;

  }
}
