import { Injectable } from '@angular/core';
import { of, Observable, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { PeriodicItem } from './periodic.model';

@Injectable({
  providedIn: 'root'
})
export class PeriodicService {
  private _mockItems: PeriodicItem[] = [
    { name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { name: 'Helium', weight: 4.0026, symbol: 'He' },
    { name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { name: 'Boron', weight: 10.811, symbol: 'B' },
    { name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { name: 'Neon', weight: 20.1797, symbol: 'Ne' }
  ];

  public getItemsWithPagination(
    seachText: string,
    pageSize: number,
    pageIndex: number,
    sortColumn: string,
    orderBy: string
  ): Observable<{
    totalCount: number;
    items: PeriodicItem[];
  }> {
    if (pageIndex === 3) {
      return this.fakeError();
    }

    let query = this._mockItems;

    if (seachText) {
      query = query.filter(a =>
        a.name.toLocaleLowerCase().includes(seachText.toLocaleLowerCase())
      );
    }

    const totalCount = query.length;

    // fix search asc, desc
    let items = query.sort(function(a, b) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
      const nameA = a[sortColumn].toUpperCase();
      const nameB = b[sortColumn].toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    if (orderBy === 'desc') {
      items.reverse();
    }

    items = items.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    // fix row number
    let startNo = pageSize * pageIndex + 1;
    for (let item of items) {
      item.no = startNo;
      startNo++;
    }

    return of({ totalCount, items }).pipe(
      catchError(error => {
        console.error(error);
        return throwError(error);
      }),
      delay(350)
    );
  }

  private fakeError() {
    const source = throwError('This is an error!');
    return source.pipe(
      catchError(error => {
        console.error(error);
        return throwError(error);
      })
    );
  }
}
