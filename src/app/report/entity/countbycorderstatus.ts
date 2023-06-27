export class Countbycorderstatus {

  public id !: number;
  public corderstatus !: string;
  public count !: number;
  public percentage !: number;

  constructor(id:number,corderstatus:string,count:number,percentage:number) {
    this.id=id;
    this.corderstatus=corderstatus;
    this.count=count;
    this.percentage=percentage;
  }

}
