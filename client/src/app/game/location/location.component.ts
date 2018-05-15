import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DataService } from '../../data.service';

import { GameLocation } from '../../models/gamelocation';
import { PlayerData } from '../../models/playerdata';
import { Opportunity } from '../../models/opportunity';

import * as _ from 'underscore';


@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class GameLocationComponent implements OnInit {

	currentLocation: GameLocation;

  actions: number;
  money: number;
  commLevel: number;
  jobLevel: number;
  englishLevel: number;

  public hasTransit: boolean;
  public hasJob: boolean;
	
  constructor(private route: ActivatedRoute, private router: Router, private _dataSvc: DataService) {

    this.money = this._dataSvc.playerData.money;
    this.actions = this._dataSvc.playerData.actions;

    this.commLevel = this._dataSvc.playerData.commLevel;
    this.jobLevel = this._dataSvc.playerData.jobLevel;
    this.englishLevel = this._dataSvc.playerData.englishLevel;

    this._dataSvc.playerDataUpdate.subscribe((data: PlayerData) => {

      this.money = data.money;
      this.actions = data.actions;

      this.commLevel = data.commLevel;
      this.jobLevel = data.jobLevel;
      this.englishLevel = data.englishLevel;

      if(data.gotTransit)
        this.hasTransit = true;
      else if(data.gotJob)
        this.hasJob = true;

    });
 
      this._dataSvc.locationDataUpdate.subscribe((data: GameLocation) => {

        this.currentLocation = data;

      });

  }

  ngOnInit() {

  	let url = this.route.snapshot.params.locationUrl;
  	this.currentLocation = this._dataSvc.getLocationByKey(url);

    if(this.currentLocation === undefined)
      this.router.navigateByUrl('/game/home');

  }

  getCosts(opportunity: Opportunity) {

    let costs = [];

    if(opportunity.actionCost > 0)
      costs.push({icon: 'action', amt: opportunity.actionCost, has: opportunity.actionCost<=this.actions});
    if(opportunity.moneyCost > 0)
      costs.push({icon: 'money', amt: opportunity.moneyCost, has: opportunity.moneyCost<=this.money});
    if(opportunity.commCost > 0)
      costs.push({icon: 'community', amt: opportunity.commCost});
    if(opportunity.jobCost > 0)
      costs.push({icon: 'job', amt: opportunity.jobCost});
    if(opportunity.englishCost > 0)
      costs.push({icon: 'english', amt: opportunity.englishCost});
    if(opportunity.requiresTransit === true)
      costs.push({icon: 'transit'});
    if(opportunity.requiresJob === true)
      costs.push({icon: 'job'});

    console.log(costs)

    return costs;

  }

  viewOpportunity(id: Opportunity["_id"]) {

    let detailsParent = document.getElementById('details');
    let allDetails = document.querySelector('#details').querySelectorAll('.opportunity');
    let detailsChild = (<HTMLElement>document.getElementById('detail_' + id));

    _.each(allDetails, (el) => {
      (<HTMLElement>el).style.display = 'none';
    });

    // detailsParent.style.display = 'block';
    TweenLite.to(detailsParent, .5, {autoAlpha:1, display:'block'});
    TweenLite.to(document.getElementById('list'), .5, {autoAlpha:0, display:'none', oncomplete:() => {

      TweenLite.fromTo(detailsChild, 2, {autoAlpha:0}, {autoAlpha:1, delay:.5, display:'block', ease:Elastic.easeOut});
    
    }});

  }

  backToList(modalId: string) { 
    
    TweenLite.to(document.getElementById('detail_'+modalId), 1, {autoAlpha:0, display:'none', ease: Back.easeIn, oncomplete:() => {

      TweenLite.to(document.getElementById('list'), 1, {autoAlpha:1, display:'block'});
      TweenLite.to(document.getElementById('details'), .5, {autoAlpha:0, display:'none'});
    
    }});

  }

  selectOpportunity(opportunity: Opportunity, modalId: string) {

    this._dataSvc.updateOpportunity(opportunity, this.route.snapshot.params.locationUrl);
    this.backToList(modalId);

    if(opportunity.locationUnlocks !== undefined && opportunity.locationUnlocks.length > 0) {
      this._dataSvc.enableLocations(opportunity.locationUnlocks);
      return;
    }
    
    this._dataSvc.updateStats(-opportunity.moneyCost, -opportunity.actionCost, opportunity.commReward, opportunity.jobReward, opportunity.englishReward, opportunity.triggerAmt);

    if(opportunity.givesTransit)
      this._dataSvc.modifyPlayerData('hasTransit', true);
    else if(opportunity.givesJob)
      this._dataSvc.modifyPlayerData('hasJob', true);
    
    // Duration effect?
    if(opportunity.effect)
      this._dataSvc.startDurationEffect(opportunity.effect, opportunity.effectTrigger, opportunity.effectWait);

  }

}
