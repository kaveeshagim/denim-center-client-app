import {Invoice} from "./invoice";
import {Product} from "./product";
import {Customer} from "./customer";


export class Customerreturn {

  public id!: number;
  public qty !: string;
  public date !: string;
  public reason !: string;
  public returncost !: string;
  public invoice !: Invoice;
  public customer !: Customer;

  constructor(id: number, qty: string, date: string, reason: string, returncost: string, invoice: Invoice,
              customer: Customer) {

    this.id = id;
    this.qty = qty;
    this.date = date;
    this.reason = reason;
    this.returncost = returncost;
    this.invoice = invoice;
    this.customer = customer;

  }
}
