import {Customer} from "./customer";
import {Orderstatus} from "./orderstatus";
import { Product } from "./product";

export class Corder {
 public id!: number ;
 public qty!: number;
 public number!: string;
 public unitprice!: string;
 public totalprice!: string;
 public orderdate!: string;
 public duedate!: string;
 public remarks!: string;
 public customer!: Customer;
 public orderstatus!: Orderstatus;
 public product!: Product;

 constructor(id: number, number: string, qty:number, unitprice:string,totalprice:string, product:Product, orderdate: string, duedate: string, remarks: string, customer: Customer, orderstatus: Orderstatus) {

   this.id = id;
   this.number = number;
   this.qty = qty;
   this.unitprice = unitprice;
   this.totalprice = totalprice;
   this.product = product;
   this.orderdate = orderdate;
   this.duedate = duedate;
   this.remarks = remarks;
   this.customer = customer;
   this.orderstatus = orderstatus;
 }
}
