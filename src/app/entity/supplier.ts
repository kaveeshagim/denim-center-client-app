

export class Supplier {

  public id !: number;
  public companyname !: string;
  public name !: string;
  public mobile !: string;
  public address !: string;
  public nic !: string;
  public email !: string;
  public city !: string;
  public dateadded !: string;

  constructor(id:number, companyname:string, name: string, mobile: string,  address: string, nic: string, email: string, city: string, dateadded: string) {

    this.id = id;
    this.companyname = companyname;
    this.name = name;
    this.mobile = mobile;
    this.address = address;
    this.nic = nic;
    this.email =  email;
    this.city = city;
    this.dateadded = dateadded;
  }
}
