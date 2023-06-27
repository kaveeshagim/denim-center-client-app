
import {Customer} from "./customer";

import {Invoicestatus} from "./invoicestatus";
import {Corder} from "./corder";

export class Invoice {

  public id !: number;
  public number !: string;
  public remarks !: string;
  public totalamount !: string;
  public paidamount !: string;
  public datecreated !: string;
  public corder !: Corder;
  public customer !: Customer;
  public invoicestatus !: Invoicestatus;

  constructor(id: number, number: string, remarks: string, totalamount: string, paidamount: string, datecreated: string, corder: Corder,
              customer: Customer, invoicestatus: Invoicestatus) {

    this.id = id;
    this.number = number;
    this.remarks = remarks;
    this.totalamount = totalamount;
    this.paidamount = paidamount;
    this.datecreated = datecreated;
    this.corder = corder;
    this.customer = customer;
    this.invoicestatus = invoicestatus;
  }


}
