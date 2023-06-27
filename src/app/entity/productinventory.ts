
import {Product} from "./product";

export class Productinventory {
  public id !: number;
  public number !: string;
  public qty !: number;
  public updateddate !: string;
  public reorderlevel !: number;
  public product !: Product;

  constructor(id:number,  number : string, qty : number, updateddate : string, reorderlevel : number, product : Product) {
    this.id = id;
    this.number = number;
    this.qty = qty;
    this.updateddate = updateddate;
    this.reorderlevel = reorderlevel;
    this.product = product;

  }
}
