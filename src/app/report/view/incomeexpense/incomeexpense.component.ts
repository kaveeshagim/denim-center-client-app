import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Expense} from "../../entity/expense";
import {ReportService} from "../reportservice";
import {Income} from "../../entity/income";
import {Incomeexpense} from "../../entity/incomeexpense";
import {Type} from "../../../entity/type";
import {DatePipe} from "@angular/common";

declare var google: any;
@Component({
  selector: 'app-incomeexpense',
  templateUrl: './incomeexpense.component.html',
  styleUrls: ['./incomeexpense.component.css']
})
export class IncomeexpenseComponent implements OnInit{

  expenses!: Expense[];
  income!: Income[];
  @ViewChild('barchart', { static: false }) barchart: any;

  constructor(private rs: ReportService, private dp: DatePipe) {
    //Define Interactive Panel with Needed Form Elements
  }

  ngOnInit(): void {
    this.rs.dailyExpense()
      .then((des: Expense[]) => {
        this.expenses = des;
      }).finally(() => {
      this.loadCharts();
    });
    this.rs.dailyIncome()
      .then((des: Income[]) => {
        this.income = des;
      }).finally(() => {
      this.loadCharts();
    });
  }


  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }
  drawCharts() {

    const barData = new google.visualization.DataTable();
    barData.addColumn('date', 'new Date(formattedDate)');
    barData.addColumn('number', 'Amount');


    const barOptions = {
      title: 'Incomes & Expenses (Bar Chart)',
      subtitle: 'Income & Expenses',
      bars: 'horizontal',
      height: 400,
      width: 600
    };



    const barChart = new google.visualization.BarChart(this.barchart.nativeElement);
    barChart.draw(barData, barOptions);


  }

}
