import {Supplier} from "./supplier";
import {Orderstatus} from "./orderstatus";
import {Material} from "./material";

export class Porder {
  public id!: number ;
  public qty!: number;
  public number!: string;
  public unitprice!: string;
  public totalprice!: string;
  public orderdate!: string;
  public duedate!: string;
  public remarks!: string;
 public supplier!: Supplier;
 public orderstatus!: Orderstatus;
 public material!: Material;

 constructor(id: number, number: string, qty: number, unitprice: string, totalprice: string, orderdate: string, duedate: string, remarks: string,supplier: Supplier,orderstatus: Orderstatus, material: Material) {

   this.id = id;
   this.number = number;
   this.qty = qty;
   this.unitprice = unitprice;
   this.totalprice = totalprice;
   this.orderdate = orderdate;
   this.duedate = duedate;
   this.remarks = remarks;
   this.supplier = supplier;
   this.material = material;
   this.orderstatus = orderstatus;
 }
}
