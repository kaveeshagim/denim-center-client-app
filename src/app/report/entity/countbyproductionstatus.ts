export class Countbyproductionstatus {

  public id !: number;
  public productionstatus !: string;
  public count !: number;
  public percentage !: number;

  constructor(id:number,productionstatus:string,count:number,percentage:number) {
    this.id=id;
    this.productionstatus=productionstatus;
    this.count=count;
    this.percentage=percentage;
  }

}
