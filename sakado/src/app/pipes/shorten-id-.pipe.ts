import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenId'
})
export class ShortenIdPipe implements PipeTransform {
  transform(id: string | undefined, length: number = 8): string {
    if (!id) return '';
    return id.length > length ? `${id.substring(0, length)}...` : id;
  }
}