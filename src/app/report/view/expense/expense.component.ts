import {Component, OnInit, ViewChild} from '@angular/core';
import {Expense} from "../../entity/expense";
import {MatTableDataSource} from "@angular/material/table";
import {ReportService} from "../reportservice";

declare var google: any
@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit{

  expenses!: Expense[];
  data!: MatTableDataSource<Expense>;

  periods: string[] = ['daily', 'weekly', 'monthly','yearly'];
  selectedPeriod: string = '';

  columns: string[] = ['date', 'amount'];
  headers: string[] = ['Date', 'Amount'];
  binders: string[] = ['date', 'amount'];

  @ViewChild('barchart', { static: false }) barchart: any;


  constructor(private rs: ReportService) {
    //Define Interactive Panel with Needed Form Elements
  }

  ngOnInit(): void {
    this.rs.dailyExpense()
      .then((des: Expense[]) => {
        this.expenses = des;
      }).finally(() => {
      this.loadTable();
      this.loadCharts();
    });
  }

  loadTable() : void{
    this.data = new MatTableDataSource(this.expenses);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  calculateTotalExpenses() {
    let total = 0;
    for (const expense of this.expenses) {
      total += expense.amount;
    }
    return total;
  }


  generate() {
    if (this.selectedPeriod === 'daily') {
      this.rs.dailyExpense()
        .then((des: Expense[]) => {
          this.expenses = des;
        }).finally(() => {
        this.loadTable();
        this.loadCharts();
      });
    } else if (this.selectedPeriod === 'weekly') {
      this.rs.weeklyExpense()
        .then((des: Expense[]) => {
          this.expenses = des;
        }).finally(() => {
        this.loadTable();
        this.loadCharts();
      });
    } else if (this.selectedPeriod === 'monthly') {
      this.rs.monthlyExpense()
        .then((des: Expense[]) => {
          this.expenses = des;
        }).finally(() => {
        this.loadTable();
        this.loadCharts();
      });
    } else if (this.selectedPeriod === 'yearly') {
      this.rs.yearlyExpense()
        .then((des: Expense[]) => {
          this.expenses = des;
        }).finally(() => {
        this.loadTable();
        this.loadCharts();
      });
    }
  }

  print() {
    window.print();
  }

  drawCharts() {

    const barData = new google.visualization.DataTable();
    barData.addColumn('date', 'Date');
    barData.addColumn('number', 'Amount');


    this.expenses.forEach((des: Expense) => {
      barData.addRow([des.date, des.amount]);

    });

    const barOptions = {
      title: 'Expenses (Bar Chart)',
      subtitle: 'Expenses',
      bars: 'horizontal',
      height: 400,
      width: 600
    };


    const barChart = new google.visualization.BarChart(this.barchart.nativeElement);
    barChart.draw(barData, barOptions);

  }
}
