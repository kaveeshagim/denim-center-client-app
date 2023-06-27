
import {Product} from "./product";
import {Productinventory} from "./productinventory";
import {Movementtype} from "./movementtype";

export class Productmovement {
  public id !: number;
  public date !: string;
  public qty !: number;
  public remarks !: string;
  public productinventory !: Productinventory;
  public movementtype !: Movementtype;

  constructor(id:number,  date : string, qty : number, remarks : string, productinventory : Productinventory, movementtype : Movementtype) {
    this.id = id;
    this.date = date;
    this.qty = qty;
    this.remarks = remarks;
    this.productinventory = productinventory;
    this.movementtype = movementtype;

  }
}
