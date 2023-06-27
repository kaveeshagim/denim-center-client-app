export class Countbyporderstatus {

  public id !: number;
  public porderstatus !: string;
  public count !: number;
  public percentage !: number;

  constructor(id:number,porderstatus:string,count:number,percentage:number) {
    this.id=id;
    this.porderstatus=porderstatus;
    this.count=count;
    this.percentage=percentage;
  }

}
