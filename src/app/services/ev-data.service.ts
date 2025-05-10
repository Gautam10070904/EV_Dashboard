import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import * as Papa from 'papaparse';
@Injectable({
  providedIn: 'root'
})
export class EvDataService {

  constructor(private http: HttpClient) { }

  
  getEVData(): Observable<any[]> {
    return this.http
      .get('/assets/Electric_Vehicle_Population_Data.csv', { responseType: 'text' })
      .pipe(
        map((data) => {
          const parsedData = Papa.parse(data, { header: true });
          return parsedData.data;
        })
      );
  }
}
