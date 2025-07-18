import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  scrollToForm() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }
}
