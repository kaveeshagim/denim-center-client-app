import {Supplier} from "./supplier";
import {Grnstatus} from "./grnstatus";
import {Porder} from "./porder";
import {Product} from "./product";
import {Productionstatus} from "./productionstatus";

export class Productionorder {

  public id !: number;
  public number !: string;
  public orderdate !: string;
  public requireddate !: string;
  public qty !: string;
  public product !: Product;
  public productionstatus !: Productionstatus;

  constructor(id: number, number: string, orderdate: string, requireddate: string, qty: string, product: Product, productionstatus: Productionstatus) {

    this.id = id;
    this.number = number;
    this.orderdate = orderdate;
    this.requireddate = requireddate;
    this.qty = qty;
    this.product = product;
    this.productionstatus = productionstatus;

  }


}
