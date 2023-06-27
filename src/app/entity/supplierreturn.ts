
import {Grn} from "./grn";
import {Supplier} from "./supplier";


export class Supplierreturn {

  public id!: number;
  public qty !: string;
  public date !: string;
  public reason !: string;
  public returncost !: string;
  public grn !: Grn;
  public supplier !: Supplier;

  constructor(id: number, qty: string, date: string, reason: string, returncost: string, grn: Grn,
              supplier: Supplier) {

    this.id = id;
    this.qty = qty;
    this.date = date;
    this.reason = reason;
    this.returncost = returncost;
    this.grn = grn;
    this.supplier = supplier;

  }
}
