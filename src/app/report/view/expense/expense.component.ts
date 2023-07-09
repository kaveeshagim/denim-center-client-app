import {Component, OnInit, ViewChild} from '@angular/core';
import {Expense} from "../../entity/expense";
import {MatTableDataSource} from "@angular/material/table";
import {ReportService} from "../reportservice";
import {TokenStorageService} from "../../../view/services/token-storage.service";

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
  @ViewChild('linechart', { static: false }) linechart: any;

  constructor(private rs: ReportService, private ts: TokenStorageService) {
    //Define Interactive Panel with Needed Form Elements
  }

  ngOnInit(): void {
    if (this.ts.getUser().roles.includes("ROLE_ADMIN")) {
      this.rs.dailyExpense()
        .then((des: Expense[]) => {
          this.expenses = des;
        }).finally(() => {
        this.loadTable();
        this.loadCharts();
      });
    }
  }

  loadTable() : void{
    this.data = new MatTableDataSource(this.expenses);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  calculateTotalExpenses(): number {
    let total = 0;
    if (this.expenses) {
      for (const expense of this.expenses) {
        total += expense.amount;
      }
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

    const lineData = new google.visualization.DataTable();
    lineData.addColumn('date', 'Date');
    lineData.addColumn('number', 'Amount');


    this.expenses.forEach((des: Expense) => {
      const dateValue = new Date(des.date); // Convert des.date to a Date object
      barData.addRow([dateValue, des.amount]);
      lineData.addRow([dateValue, des.amount]);
    });



    const barOptions = {
      title: 'Expenses (Bar Chart)',
      subtitle: 'Expenses',
      bars: 'horizontal',
      height: 400,
      width: 600
    };

    const lineOptions = {
      title: 'Expenses (Line Chart)',
      height: 400,
      width: 1200
    };


    const barChart = new google.visualization.BarChart(this.barchart.nativeElement);
    barChart.draw(barData, barOptions);

    const lineChart = new google.visualization.LineChart(this.linechart.nativeElement);
    lineChart.draw(lineData, lineOptions);

  }
}
