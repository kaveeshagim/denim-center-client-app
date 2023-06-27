import {Material} from "./material";
import {Productionorder} from "./productionorder";

export class Billofmaterial {
  public id !: number;
  public qty !: string;
  public material !: Material;
  public productionorder !: Productionorder;

  constructor(id:number, qty:string, material: Material, productionorder: Productionorder) {
    this.id = id;
    this.qty = qty;
    this.material = material;
    this.productionorder = productionorder;
  }
}
