import { Component, OnInit } from '@angular/core';
import { EvDataService } from 'src/app/services/ev-data.service';
import {
  ApexChart, ApexAxisChartSeries, ApexTitleSubtitle, ApexXAxis, ApexYAxis, ApexDataLabels, ApexFill, ApexPlotOptions
} from 'ng-apexcharts';

import * as L from 'leaflet';
export type ChartOptions = {
  series: ApexAxisChartSeries | number[];
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  dataLabels?: ApexDataLabels;
  fill?: ApexFill;
  plotOptions?: ApexPlotOptions;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalEVs: number = 0;
  topManufacturer: string = '';
  topCounty: string = '';
  growthRate: number = 0;
  evData: any[] = [];
  manufacturersChartOptions!: ChartOptions;
  evTypeChartOptions!: ChartOptions;
  rangeChartOptions!: ChartOptions;
  growthChartOptions!: ChartOptions;
  manufacturers: { name: string, count: number }[] = [];
  vehicleData: any;
  topCounties: any
  avgRange: any;
  topManufacturers: any


  constructor(private dataService: EvDataService) { }

  ngOnInit(): void {
    this.getEvData();

  }

  getEvData() {
    this.dataService.getEVData().subscribe((data) => {
      this.totalEVs = data.length;
      this.evData = data;
      this.calculateTopManufacturer(data);
      this.calculateTopCounty(data);
      this.calculateGrowthRate(data);
      this.calculateAvgRange(data)
      this.processManufacturerData(data);
      this.processEVTypeData(data);
      this.processRangeData(data);
      this.processGrowthData(data);

    });
  }

  calculateTopManufacturer(data: any[]): void {
    const manufacturerCounts = data.reduce((acc, ev) => {
      acc[ev.Make] = (acc[ev.Make] || 0) + 1;
      return acc;
    }, {});

    this.topManufacturers = Object.keys(manufacturerCounts).map(make => ({
      name: make,
      count: manufacturerCounts[make]
    })).sort((a, b) => b.count - a.count);
  }

  // Calculate top counties based on count
  calculateTopCounty(data: any[]): void {
    const countyCounts = data.reduce((acc, ev) => {
      acc[ev.County] = (acc[ev.County] || 0) + 1;
      return acc;
    }, {});

    this.topCounties = Object.keys(countyCounts).map(county => ({
      name: county,
      count: countyCounts[county]
    })).sort((a, b) => b.count - a.count);
  }

  // Calculate the average range of EVs
  calculateAvgRange(data: any[]): void {
    const totalRange = data.reduce((acc, ev) => {
      const range = parseFloat(ev['Electric Range']);
      if (!isNaN(range)) {
        return acc + range;
      }
      return acc; // if the value is not a valid number, skip it
    }, 0);
  
    this.avgRange = data.length > 0 ? totalRange / data.length : 0; // Avoid division by zero
  }



  calculateGrowthRate(data: any[]): void {
    const groupedByYear = data.reduce((acc, ev) => {
      const year = new Date(ev.RegistrationDate).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    const years = Object.keys(groupedByYear).map(Number).sort();
    if (years.length > 1) {
      const lastYear = groupedByYear[years[years.length - 1]];
      const prevYear = groupedByYear[years[years.length - 2]];
      this.growthRate = ((lastYear - prevYear) / prevYear) * 100;
    }
  }

  processManufacturerData(data: any[]): void {
    const counts: { key: number, valuse: any } = data.reduce((acc, ev) => {
      acc[ev.Make] = (acc[ev.Make] || 0) + 1;
      return acc;
    }, {});
    this.manufacturersChartOptions = {
      series: [{ name: 'Count', data: Object.values(counts) }],
      chart: { type: 'bar', height: 350 },
      xaxis: { categories: Object.keys(counts) },
      title: { text: 'EVs by Manufacturer' },
      labels: []
    };
  }

  processEVTypeData(data: any[]): void {
    const counts: { key: number, valuse: any } = data.reduce((acc, ev) => {
      acc[ev['Electric Vehicle Type']] = (acc[ev['Electric Vehicle Type']] || 0) + 1;
      return acc;
    }, {});
    this.evTypeChartOptions = {
      series: Object.values(counts),
      chart: { type: 'pie', height: 350 },
      labels: Object.keys(counts),
      title: { text: 'EV Types Distribution' },
      xaxis: {}
    };
  }

  processRangeData(data: any[]): void {
    const ranges = data.map(ev => Number(ev['Electric Range']));
    const categories = ['<100', '100-200', '200-300', '>300'];
    const counts = [0, 0, 0, 0];
    ranges.forEach(range => {
      if (range < 100) counts[0]++;
      else if (range <= 200) counts[1]++;
      else if (range <= 300) counts[2]++;
      else counts[3]++;
    });
    this.rangeChartOptions = {
      series: counts,
      chart: { type: 'donut', height: 350 },
      labels: categories,
      title: { text: 'EV Range Distribution' },
      xaxis: {}
    };
  }

  processGrowthData(data: any[]): void {
    // Group the data by Model Year
    const groupedByYear: { key: Number, value: any } = data.reduce((acc, ev) => {
      const year = ev['Model Year']; // Use 'Model Year' instead of 'RegistrationDate'
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    this.growthChartOptions = {
      series: [{ name: 'EV Growth', data: Object.values(groupedByYear) }],
      chart: { type: 'line', height: 350 },
      xaxis: { categories: Object.keys(groupedByYear) },
      title: { text: 'EV Growth Over Time (by Model Year)' },
      labels: [],
    };
  }

}
