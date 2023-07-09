import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ReportService} from "../reportservice";
import {Countbyproductionstatus} from "../../entity/countbyproductionstatus";
import {TokenStorageService} from "../../../view/services/token-storage.service";

declare var google: any;

@Component({
  selector: 'app-countbyproductionstatus',
  templateUrl: './countbyproductionstatus.component.html',
  styleUrls: ['./countbyproductionstatus.component.css']
})
export class CountbyproductionstatusComponent implements OnInit{

  countbyproductionstatuses!: Countbyproductionstatus[];
  data!: MatTableDataSource<Countbyproductionstatus>;

  columns: string[] = ['productionstatus', 'count', 'percentage'];
  headers: string[] = ['Productionstatus', 'Count', 'Percentage'];
  binders: string[] = ['productionstatus', 'count', 'percentage'];

  @ViewChild('barchart', { static: false }) barchart: any;
  @ViewChild('piechart', { static: false }) piechart: any;
  @ViewChild('linechart', { static: false }) linechart: any;

  constructor(private rs: ReportService, private ts: TokenStorageService) {
    //Define Interactive Panel with Needed Form Elements
  }

  ngOnInit(): void {
    if (this.ts.getUser().roles.includes("ROLE_ADMIN")) {
      this.rs.countbyproductionstatus()
        .then((des: Countbyproductionstatus[]) => {
          this.countbyproductionstatuses = des;
        }).finally(() => {
        this.loadTable();
        this.loadCharts();
      });
    }
  }

  loadTable() : void{
    this.data = new MatTableDataSource(this.countbyproductionstatuses);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  print() {
    window.print();
  }

  drawCharts() {

    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'ProductionStatus');
    barData.addColumn('number', 'Count');

    const pieData = new google.visualization.DataTable();
    pieData.addColumn('string', 'ProductionStatus');
    pieData.addColumn('number', 'Count');

    const lineData = new google.visualization.DataTable();
    lineData.addColumn('string', 'ProductionStatus');
    lineData.addColumn('number', 'Count');

    this.countbyproductionstatuses.forEach((des: Countbyproductionstatus) => {
      barData.addRow([des.productionstatus, des.count]);
      pieData.addRow([des.productionstatus, des.count]);
      lineData.addRow([des.productionstatus, des.count]);
    });

    const barOptions = {
      title: 'ProductionStatus Count (Bar Chart)',
      subtitle: 'Count of Production Orders by Production Status',
      bars: 'horizontal',
      height: 400,
      width: 600
    };

    const pieOptions = {
      title: 'ProductionStatus Count (Pie Chart)',
      height: 400,
      width: 550
    };

    const lineOptions = {
      title: 'ProductionStatus Count (Line Chart)',
      height: 400,
      width: 600
    };

    const barChart = new google.visualization.BarChart(this.barchart.nativeElement);
    barChart.draw(barData, barOptions);

    const pieChart = new google.visualization.PieChart(this.piechart.nativeElement);
    pieChart.draw(pieData, pieOptions);

    const lineChart = new google.visualization.LineChart(this.linechart.nativeElement);
    lineChart.draw(lineData, lineOptions);
  }

}
