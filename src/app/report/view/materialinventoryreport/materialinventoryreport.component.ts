import {Component, OnInit, ViewChild} from '@angular/core';
import {Materialinventory} from "../../../entity/materialinventory";
import {MatTableDataSource} from "@angular/material/table";
import {MaterialinventoryService} from "../../../service/materialinventoryservice";
import {UiAssist} from "../../../util/ui/ui.assist";

declare var google: any;
@Component({
  selector: 'app-materialinventoryreport',
  templateUrl: './materialinventoryreport.component.html',
  styleUrls: ['./materialinventoryreport.component.css']
})
export class MaterialinventoryreportComponent implements OnInit{

  materialinventories!: Materialinventory[];
  data!: MatTableDataSource<Materialinventory>;

  uiassist:UiAssist;

  columns: string[] = ['material', 'reorderlevel', 'qty', 'inventorystatus'];
  headers: string[] = ['Material', 'Reorderlevel', 'Quantity', 'Inventory Status'];
  binders: string[] = ['material.name', 'reorderlevel', 'qty', 'inventorystatus'];


  @ViewChild('barchart', { static: false }) barchart: any;


  constructor(
    private pis: MaterialinventoryService
  ) {
    this.uiassist = new UiAssist(this);
  }

  ngOnInit(): void {

    /*this.pis.getAllList()
      .then((des: Materialinventory[]) => {
        this.materialinventories = des;
      }).finally(() => {
      this.loadTable();
      this.loadCharts();
    });*/

      this.pis.getAllList()
        .then((des: Materialinventory[]) => {
          this.materialinventories = des;
          this.materialinventories = this.calculateInventoryStatus();
          this.displayDataInConsole(); // Call the function to display data
        })
        .finally(() => {
          this.loadTable();
          this.loadCharts();
        });
    }



    displayDataInConsole(): void {
      console.log('Retrieved Material Inventories:');
      console.log(this.materialinventories);
    }

  calculateInventoryStatus(): Materialinventory[] {
    return this.materialinventories.map((materialinventory: Materialinventory) => {
      const inventorystatus = materialinventory.qty < materialinventory.reorderlevel ? 'Low Inventory' : 'Available';
      return { ...materialinventory, inventorystatus };
    });
  }

  print() {
    window.print();
  }


  loadTable() : void{
    this.data = new MatTableDataSource(this.materialinventories);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  drawCharts() {

    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'Material');
    barData.addColumn('number', 'Quantity');
    barData.addColumn('number', 'ReorderLevel');


    this.materialinventories.forEach((des: Materialinventory) => {
      barData.addRow([des.material.name, des.qty, des.reorderlevel]);
    });

    const barOptions = {
      title: 'Material Inventory (Bar Chart)',
      subtitle: 'Material Inventory',
      bars: 'vertical',
      height: 400,
      width: 600
    };


    const barChart = new google.visualization.BarChart(this.barchart.nativeElement);
    barChart.draw(barData, barOptions);

  }

}
