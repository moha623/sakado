import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-more-details',
  standalone: false,
  templateUrl: './more-details.component.html',
  styleUrl: './more-details.component.scss'
})
export class MoreDetailsComponent implements OnInit {
  // cardId: string;
  // cardData: any;
  //   constructor(private route: ActivatedRoute) {}

  //     ngOnInit() {
  //   this.cardId = this.route.snapshot.paramMap.get('id');
  //   // Fetch or filter data based on cardId
  //   this.cardData = this.getCardDataById(this.cardId);
  // }

  // getCardDataById(id: string) {
  //   // Replace with your data fetching logic or fake API call
  //   return FAKE_DATA.find(card => card.id === id);
  // }
   ngOnInit() {}

}
