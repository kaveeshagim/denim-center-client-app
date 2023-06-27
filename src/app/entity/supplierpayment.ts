
import {Product} from "./product";
import {Supplier} from "./supplier";
import {Grn} from "./grn";
import {Paymentmethod} from "./paymentmethod";
import {Paymentstatus} from "./paymentstatus";

export class Supplierpayment {
  public id !: number;
  public date !: Date;
  public amount !: string;
  public remarks !: string;
  public supplier !: Supplier;
  public grn !: Grn;
  public paymentmethod !: Paymentmethod;
  public paymentstatus !: Paymentstatus;

  constructor(id:number,  date : Date, amount : string, remarks : string, supplier : Supplier, grn : Grn,paymentmethod : Paymentmethod, paymentstatus : Paymentstatus) {
    this.id = id;
    this.date = date;
    this.amount = amount;
    this.remarks = remarks;
    this.supplier = supplier;
    this.grn = grn;
    this.paymentmethod = paymentmethod;
    this.paymentstatus = paymentstatus;

  }
}
