
import {Product} from "./product";
import {Supplier} from "./supplier";
import {Grn} from "./grn";
import {Paymentmethod} from "./paymentmethod";
import {Paymentstatus} from "./paymentstatus";
import {Customer} from "./customer";
import {Invoice} from "./invoice";

export class Customerpayment {
  public id !: number;
  public date !: Date;
  public amount !: string;
  public remarks !: string;
  public customer !: Customer;
  public invoice !: Invoice;
  public paymentmethod !: Paymentmethod;
  public paymentstatus !: Paymentstatus;

  constructor(id: number,  date : Date, amount : string, remarks : string, customer : Customer, invoice : Invoice, paymentmethod : Paymentmethod, paymentstatus : Paymentstatus) {
    this.id = id;
    this.date = date;
    this.amount = amount;
    this.remarks = remarks;
    this.customer = customer;
    this.invoice = invoice;
    this.paymentmethod = paymentmethod;
    this.paymentstatus = paymentstatus;

  }
}
