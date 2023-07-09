import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialinventoryService } from '../../service/materialinventoryservice';
import { TokenStorageService } from '../services/token-storage.service';
import {Materialinventory} from "../../entity/materialinventory";
import {Productinventory} from "../../entity/productinventory";
import {ProductinventoryService} from "../../service/productinventoryservice";
import {Countbyproductionstatus} from "../../report/entity/countbyproductionstatus";
import {ReportService} from "../../report/view/reportservice";
import {Expense} from "../../report/entity/expense";
import {Income} from "../../report/entity/income";
import {DatePipe} from "@angular/common";

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  materialinventories!: Materialinventory[];
  productinventories!: Productinventory[];
  countbyproductionstatuses!: Countbyproductionstatus[];
  expenses!: Expense[];
  income!: Income[];
  @ViewChild('barchart1', { static: false }) barchart1: any;
  @ViewChild('barchart2', { static: false }) barchart2: any;
  @ViewChild('donutchart', { static: false }) donutchart: any;
  @ViewChild('piechart', { static: false }) piechart: any;

  constructor(
    private mis: MaterialinventoryService,
    private pis: ProductinventoryService,
    private rs: ReportService,
    private ts: TokenStorageService,
    private dp: DatePipe
  ) {}

  ngOnInit(): void {
    this.mis.getAllList()
      .then((des: Materialinventory[]) => {
        this.materialinventories = des;
      })
      .finally(() => {
        this.loadCharts();
      });
    this.rs.countbyproductionstatus()
      .then((des: Countbyproductionstatus[]) => {
        this.countbyproductionstatuses = des;
      }).finally(() => {
      this.loadCharts();
    });
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

  loadCharts(): void {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  drawCharts() {
    const donutData = new google.visualization.DataTable();
    donutData.addColumn('string', 'Material');
    donutData.addColumn('number', 'Quantity');

    const pieData = new google.visualization.DataTable();
    pieData.addColumn('string', 'ProductionStatus');
    pieData.addColumn('number', 'Count');

    const barDataExpense = new google.visualization.DataTable();
    barDataExpense.addColumn('date', 'new Date(formattedDate)');
    barDataExpense.addColumn('number', 'Amount');

    const barDataIncome = new google.visualization.DataTable();
    barDataIncome.addColumn('date', 'new Date(formattedDate)');
    barDataIncome.addColumn('number', 'Amount');

    const today = new Date();
    const formattedDate = this.dp.transform(today, 'yyyy-MM-dd');

    // Array of material names to display in the donut chart
    const selectedMaterials = ['Denim Fabric', 'Twill', 'Polyester', 'Indigo Dye'];

    this.materialinventories.forEach((inventory: Materialinventory) => {
      if (selectedMaterials.includes(inventory.material.name)) {
        donutData.addRow([inventory.material.name, inventory.qty]);
      }
    });

    this.countbyproductionstatuses.forEach((des: Countbyproductionstatus) => {
      pieData.addRow([des.productionstatus, des.count]);
    });

    this.expenses.forEach((des: Expense) => {
      const dateValue = new Date(des.date); // Convert des.date to a Date object
      barDataExpense.addRow([dateValue, des.amount]);;
    });

    this.income.forEach((des: Income) => {
      const dateValue = new Date(des.date); // Convert des.date to a Date object
      barDataIncome.addRow([dateValue, des.amount]);;
    });

    const donutOptions = {
      title: 'Material Inventory (Donut Chart)',
      pieHole: 0.4,
      height: 400,
      width: 500
    };

    const pieOptions = {
      title: 'ProductionStatus Count (Pie Chart)',
      height: 400,
      width: 550
    };

    const barOptionsExpense = {
      title: 'Expenses (Bar Chart)',
      subtitle: 'Expenses',
      bars: 'horizontal',
      height: 400,
      width: 600
    };

    const barOptionsIncome = {
      title: 'Income (Bar Chart)',
      subtitle: 'Expenses',
      bars: 'horizontal',
      height: 400,
      width: 600
    };

    const donutChart = new google.visualization.PieChart(this.donutchart.nativeElement);
    donutChart.draw(donutData, donutOptions);

    const pieChart = new google.visualization.PieChart(this.piechart.nativeElement);
    pieChart.draw(pieData, pieOptions);

    const barChartExpense = new google.visualization.BarChart(this.barchart1.nativeElement);
    barChartExpense.draw(barDataExpense, barOptionsExpense);

    const barChartIncome = new google.visualization.BarChart(this.barchart2.nativeElement);
    barChartIncome.draw(barDataIncome, barOptionsIncome);

  }

}
