import {Income} from "./income";
import {Expense} from "./expense";

export class Incomeexpense {


  public income: Income;
  public expense: Expense;
  date: Date;

  constructor(income:Income, expense: Expense, date:Date) {

    this.date = date;
    this.income= income;
    this.expense = expense;

  }

}
