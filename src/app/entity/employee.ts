import {Department} from "./department";
import {Empstatus} from "./empstatus";
import {Gender} from "./gender";

export class Employee {

  public id !: number;
  public firstname !: string;
  public lastname !: string;
  public mobile !: string;
  public land !: string;
  public email !: string;
  public dob !: string;
  public doj !: string;
  public address !: string;
  public nic !: string;
  public image !: string;
  public department !: Department;
  public empstatus !: Empstatus;
  public gender !: Gender;

  constructor(id:number, firstname:string, lastname: string, mobile: string, land: string, email:string,
              dob: string, doj: string, address: string, nic: string, image: string, department: Department,
              empstatus: Empstatus, gender: Gender) {

    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.mobile = mobile;
    this.land = land;
    this.email = email;
    this.dob = dob;
    this.doj = doj;
    this.address = address;
    this.nic = nic;
    this.image = image;
    this.department = department;
    this.empstatus = empstatus;
    this.gender = gender;
  }
}
