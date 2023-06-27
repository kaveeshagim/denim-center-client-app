
import {Product} from "./product";
import {Productinventory} from "./productinventory";
import {Movementtype} from "./movementtype";
import {Materialinventory} from "./materialinventory";

export class Materialmovement {
  public id !: number;
  public date !: string;
  public qty !: number;
  public remarks !: string;
  public materialinventory !: Materialinventory;
  public movementtype !: Movementtype;

  constructor(id:number,  date : string, qty : number, remarks : string, materialinventory : Materialinventory, movementtype : Movementtype) {
    this.id = id;
    this.date = date;
    this.qty = qty;
    this.remarks = remarks;
    this.materialinventory = materialinventory;
    this.movementtype = movementtype;

  }
}
