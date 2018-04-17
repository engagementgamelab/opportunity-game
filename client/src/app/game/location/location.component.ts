import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../data.service';

import { Location } from '../../models/location';
import { Service } from '../../models/service';

import { TweenLite } from 'gsap';
import * as _ from 'underscore';


@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class GameLocationComponent implements OnInit {

	currentLocation: Location;
	
  constructor(private route: ActivatedRoute, private router: Router, private dataSvc: DataService) { 

  }

  ngOnInit() {

  	let url = this.route.snapshot.params.locationUrl;
  	this.currentLocation = this.dataSvc.getLocationByUrl(url);

    if(this.currentLocation === undefined)
      this.router.navigateByUrl('/game/map');

  }

  viewOpportunity(id: Service["_id"]) {
    let detailsParent = document.getElementById('details');
    let allDetails = document.querySelector('#details').querySelectorAll('.opportunity');
    let detailsChild = document.getElementById('detail_' + id);

    _.each(allDetails, (el) => {
      el.style.display = 'none';
    });

    detailsChild.style.display = 'block';
    TweenLite.to(document.getElementById('list'), 1, {top:'100%', autoAlpha:0});
    TweenLite.to(detailsParent, 1, {top:'0%', autoAlpha:1, display:'block'});

  }

  backToList() { 

    TweenLite.to(document.getElementById('details'), 1, {top:'100%', autoAlpha:0});
    TweenLite.to(document.getElementById('list'), 1, {top:'0%', autoAlpha:1, display:'block'});

  }

  selectService(money: number, days: number) {

    // let moneyCost = getServiceInfoById(id).
    this.dataSvc.changeMoneyAndDays(-money, -days);

  }

}
