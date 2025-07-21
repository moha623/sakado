import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'simpleDate' })
export class SimpleDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}
  transform(value: any, format: string = 'mediumDate'): string | null {
    let date: Date | null = null;
    if (value && typeof value === 'object' && value.seconds !== undefined) {
      date = new Date(value.seconds * 1000 + Math.round((value.nanoseconds || 0) / 1e6));
    } else if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      date = new Date(value);
    }
    return date ? this.datePipe.transform(date, format) : null;
  }
}
