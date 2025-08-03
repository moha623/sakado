import { Component } from '@angular/core';
 
@Component({
  selector: 'app-gallery',
  standalone: false,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  photos = [
    {
      url: 'assets/images/img1.jpg',
      caption: 'Mountain View',
      category: 'Nature'
    },
    {
      url: 'assets/images/img2.jpg',
      caption: 'City Skyline',
      category: 'Urban'
    },
    {
      url: 'assets/images/img3.jpg',
      caption: 'Sunset Beach',
      category: 'Travel'
    }
  ];
}
