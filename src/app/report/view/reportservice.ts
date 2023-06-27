
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Countbyproductionstatus} from "../entity/countbyproductionstatus";
import {Countbyporderstatus} from "../entity/countbyporderstatus";
import {Countbycorderstatus} from "../entity/countbycorderstatus";
import {Expense} from "../entity/expense";

@Injectable({
  providedIn: 'root'
})

export class ReportService {

  constructor(private http: HttpClient) {  }

  async countbyproductionstatus(): Promise<Array<Countbyproductionstatus>> {

    const countbyproductionstatuses = await this.http.get<Array<Countbyproductionstatus>>('http://localhost:8080/reports/countbyproductionstatus').toPromise();
    if(countbyproductionstatuses == undefined){
      return [];
    }
    return countbyproductionstatuses;
  }

  async countbyporderstatus(): Promise<Array<Countbyporderstatus>> {

    const countbyporderstatuses = await this.http.get<Array<Countbyporderstatus>>('http://localhost:8080/reports/countbyporderstatus').toPromise();
    if(countbyporderstatuses == undefined){
      return [];
    }
    return countbyporderstatuses;
  }

  async countbycorderstatus(): Promise<Array<Countbycorderstatus>> {

    const countbycorderstatuses = await this.http.get<Array<Countbycorderstatus>>('http://localhost:8080/reports/countbycorderstatus').toPromise();
    if(countbycorderstatuses == undefined){
      return [];
    }
    return countbycorderstatuses;
  }

  async expense(): Promise<Array<Expense>> {

    const expenses = await this.http.get<Array<Expense>>('http://localhost:8080/reports/expense').toPromise();
    if(expenses == undefined){
      return [];
    }
    return expenses;
  }

  async dailyExpense(): Promise<Array<Expense>> {

    const expenses = await this.http.get<Array<Expense>>('http://localhost:8080/reports/dailyexpenses').toPromise();
    if(expenses == undefined){
      return [];
    }
    return expenses;
  }

  async weeklyExpense(): Promise<Array<Expense>> {

    const expenses = await this.http.get<Array<Expense>>('http://localhost:8080/reports/weeklyexpenses').toPromise();
    if(expenses == undefined){
      return [];
    }
    return expenses;
  }

  async monthlyExpense(): Promise<Array<Expense>> {

    const expenses = await this.http.get<Array<Expense>>('http://localhost:8080/reports/monthlyexpenses').toPromise();
    if(expenses == undefined){
      return [];
    }
    return expenses;
  }

  async yearlyExpense(): Promise<Array<Expense>> {

    const expenses = await this.http.get<Array<Expense>>('http://localhost:8080/reports/yearlyexpenses').toPromise();
    if(expenses == undefined){
      return [];
    }
    return expenses;
  }


}


