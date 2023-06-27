
import {Supplier} from "./supplier";

export class Material {

  public id !: number;
  public name !: string;
  public unitofmeasure !: string;
  public costperunit !: string;
  public reorderpoint !: string;
  public description !: string;
  public supplier !: Supplier;

  constructor(id:number, name:string, unitofmeasure: string, costperunit: string,
              reorderpoint: string, description: string, supplier: Supplier) {

    this.id = id;
    this.name = name;
    this.unitofmeasure = unitofmeasure;
    this.costperunit = costperunit;
    this.reorderpoint = reorderpoint;
    this.description = description;
    this.supplier = supplier;
  }
}
