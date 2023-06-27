import {Department} from "./department";
import {Empstatus} from "./empstatus";
import {Gender} from "./gender";
import {Color} from "./color";
import {Size} from "./size";
import {Type} from "./type";
import {Agecategory} from "./agecategory";

export class Product {
  public id !: number;
  public name !: string;
  public price !: string;
  public code !: string;
  public proddate !: string;
  public description !: string;
  public image !: string;
  public agecategory !: Agecategory;
  public color !: Color;
  public size !: Size;
  public type !: Type;
  public gender !: Gender;

  constructor(id:number, name:string, price: string, code: string, proddate: string, description: string,
              image: string, agecategory: Agecategory, color: Color, size: Size, type: Type, gender: Gender) {

    this.id = id;
    this.name = name;
    this.price = price;
    this.code = code;
    this.proddate = proddate;
    this.description = description;
    this.image = image;
    this.agecategory = agecategory;
    this.color = color;
    this.size = size;
    this.type = type;
    this.gender = gender;
  }
}
