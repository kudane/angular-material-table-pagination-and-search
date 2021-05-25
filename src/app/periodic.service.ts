import { Injectable } from '@angular/core';
import { of, Observable, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { PeriodicItem } from './periodic.model';

@Injectable({
  providedIn: 'root'
})
export class PeriodicService {
  private _mockItems: PeriodicItem[] = [
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' }
  ];

  public getItemsWithPagination(
    seachText: string,
    pageSize: number,
    pageIndex: number
  ): Observable<{
    totalCount: number;
    items: PeriodicItem[];
  }> {
    if (pageIndex === 3) {
      return ajax('www.api.fake.error.com').pipe(
        delay(350),
        catchError(error => {
          console.error(error);
          return throwError(error);
        })
      );
    }

    let query = this._mockItems;

    if (seachText) {
      query = query.filter(a =>
        a.name.toLocaleLowerCase().includes(seachText.toLocaleLowerCase())
      );
    }

    const totalCount = query.length;
    const items = query.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    return of({ totalCount, items }).pipe(
      catchError(throwError),
      delay(350)
    );
  }
}
