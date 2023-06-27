import {Supplier} from "./supplier";
import {Grnstatus} from "./grnstatus";
import {Porder} from "./porder";

export class Grn {

  public id !: number;
  public number !: string;
  public datecreated !: string;
  public totalamount !: string;
  public paidamount !: string;
  public remarks !: string;
  public porder !: Porder;
  public supplier !: Supplier;
  public grnstatus !: Grnstatus;

  constructor(id: number, number: string, datecreated: string, totalamount: string, paidamount: string, remarks: string, porder: Porder,
  supplier: Supplier, grnstatus: Grnstatus) {

    this.id = id;
    this.number = number;
    this.datecreated = datecreated;
    this.totalamount = totalamount;
    this.paidamount = paidamount;
    this.remarks = remarks;
    this.porder = porder;
    this.supplier = supplier;
    this.grnstatus = grnstatus;
  }


}
