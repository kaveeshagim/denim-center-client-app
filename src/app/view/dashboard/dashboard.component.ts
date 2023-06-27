import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";

declare var google: any;

interface IncomeExpense{
  date: string;
  income: string;
  expenses: string;
}

interface ProductionOrders{
  productionordernumber: string;
  duedate: string;
  status: string;
}

interface ProductPieChartConfig {
  data: any[];
  options: any;
  chartElement: any;
}

interface MaterialPieChartConfig {
  data: any[];
  options: any;
  chartElement: any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  assignmentData! : IncomeExpense[];
  productionorders! : ProductionOrders[];
  data1!: MatTableDataSource<IncomeExpense>;
  data2!: MatTableDataSource<ProductionOrders>;

  columns1: string[] = ['date', 'income', 'expenses'];
  headers1: string[] = ['Date', 'Income', 'Expenses'];
  binders1: string[] = ['date', 'income', 'expenses'];

  columns2: string[] = ['productionordernumber', 'duedate', 'status'];
  headers2: string[] = ['Production Order Number', 'Due Date', 'Status'];
  binders2: string[] = ['productionordernumber', 'duedate', 'status'];

  @ViewChildren('ProductInventoryPie') ProductInventoryPie!: QueryList<any>;
  @ViewChildren('MaterialInventoryPie') MaterialInventoryPie!: QueryList<any>;

  MaterialPieChartConfigs: MaterialPieChartConfig[] = [
    {
      data: [
        ['Effort', 'Amount given'],
        ['Left', 80],
        ['Used', 20],
      ],
      options: {
        title: 'Denim Fabric',
        height: 300,
        width: 200,
        pieHole: 0.5,
        pieSliceTextStyle: {
          color: 'black',
        },
        legend: 'none',
      },
      chartElement: null,
    },

    {
      data: [
        ['Effort', 'Amount given'],
        ['Left', 82],
        ['Used', 18],
      ],
      options: {
        title: 'Twill',
        height: 300,
        width: 200,
        pieHole: 0.5,
        pieSliceTextStyle: {
          color: 'black',
        },
        legend: 'none',
      },
      chartElement: null,
    },
    {
      data: [
        ['Effort', 'Amount given'],
        ['Left', 70],
        ['Used', 30],
      ],
      options: {
        title: 'Dye',
        height: 300,
        width: 200,
        pieHole: 0.5,
        pieSliceTextStyle: {
          color: 'black',
        },
        legend: 'none',
      },
      chartElement: null,
    },
  ];

  ProductPieChartConfigs: ProductPieChartConfig[] = [
    {
      data: [
        ['Effort', 'Amount given'],
        ['Left', 50],
        ['Sold', 50],
      ],
      options: {
        title: 'Adult',
        height: 300,
        width: 200,
        pieHole: 0.5,
        pieSliceTextStyle: {
          color: 'black',
        },
        legend: 'none',
      },
      chartElement: null,
    },

    {
      data: [
        ['Effort', 'Amount given'],
        ['Left', 70],
        ['Sold', 30],
      ],
      options: {
        title: 'Teen',
        height: 300,
        width: 200,
        pieHole: 0.5,
        pieSliceTextStyle: {
          color: 'black',
        },
        legend: 'none',
      },
      chartElement: null,
    },
    {
      data: [
        ['Effort', 'Amount given'],
        ['Left', 45],
        ['Sold', 55],
      ],
      options: {
        title: 'Kids',
        height: 300,
        width: 200,
        pieHole: 0.5,
        pieSliceTextStyle: {
          color: 'black',
        },
        legend: 'none',
      },
      chartElement: null,
    },
  ];

  ngOnInit(): void {
    this.loadCharts();
    this.drawTable();
    this.loadData();
  }

  loadCharts(): void {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => this.drawCharts());
  }

  drawPieChart(data: any[], options: any, chartElement: any): void {
    const pieData = google.visualization.arrayToDataTable(data);

    const pieChart = new google.visualization.PieChart(chartElement.nativeElement);
    pieChart.draw(pieData, options);
  }

  drawCharts(): void {

    this.ProductInventoryPie.forEach((chartElement, index) => {
      const config = this.ProductPieChartConfigs[index];
      config.chartElement = chartElement;
      this.drawPieChart(config.data, config.options, config.chartElement);
    });
    this.MaterialInventoryPie.forEach((chartElement, index) => {
      const config = this.MaterialPieChartConfigs[index];
      config.chartElement = chartElement;
      this.drawPieChart(config.data, config.options, config.chartElement);
    });
  }

  loadData(): void {
    this.data1 = new MatTableDataSource<IncomeExpense>(this.assignmentData);
    this.data2 = new MatTableDataSource<ProductionOrders>(this.productionorders);
  }

  drawTable(): void {
    this.assignmentData = [
      { date: '2023-05-27', income: '10,000', expenses: '5000' },
      { date: '2023-05-26', income: '15,000', expenses: '4500' },
      { date: '2023-05-25', income: '10,200', expenses: '6000' },
    ];

    this.productionorders = [
      { productionordernumber: '2301', duedate: '2023-06-01', status: 'Ongoing' },
      { productionordernumber: '2302', duedate: '2023-06-01', status: 'Ongoing' },
      {productionordernumber: '2303', duedate: '2023-06-04', status: 'Ongoing' },
    ];
  }
}

