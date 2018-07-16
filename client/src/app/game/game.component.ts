import { Component, OnInit, HostBinding, Inject, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { DOCUMENT } from "@angular/platform-browser";
import { DataService } from '../data.service';
import { slideAnimation } from '../_animations/slide';
import { TweenLite } from "gsap";

import { PlayerData } from '../models/playerdata';
import { Event } from '../models/event';
import { Goal } from '../models/goal';
import { Character } from '../models/character';

import * as _ from 'underscore';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [slideAnimation]
})
export class GameComponent implements OnInit {

  public lifeEvents: Event[];
  public effectEvents: Event[];
  public character: Character;
  public atHome: boolean = false;
  public wonGame: boolean = false;
  public currentWellnessScore: number = 0;
  public surveyUrl: string;

  eventsQueue: HTMLElement[] = [];
  
  lastWellnessScore: number = 0;
  round: number = 1;
  gameEnded: boolean;

  assignedGoal: Goal;
  
  sfxPath: string = 'https://res.cloudinary.com/engagement-lab-home/video/upload/v1000000/opportunity-game/sfx/';

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
      ion.sound({
          sounds: [
            {
              name: "confirm"
            },
            {
              name: "music-tutorial",        
              ready_callback: (obj) => {  
                setTimeout(() => 
                  { ion.sound.play('music-tutorial', {loop: true}) },
                  500);
              }
            },
            {
              name: "music-base"
            },
            {
              name: "click"
            },
            {
              name: "transition"
            },
            {
              name: "accept"
            },
            {
              name: "decline"
            },
            {
              name: "level-up"
            }
          ],
          volume: 1,
          path: this.sfxPath,
          preload: true
      });
  }

  getData() {

    // DEBUG: If no goal, get data and assign one
    if(this.assignedGoal === undefined) {
      this._dataSvc.getCharacterData().subscribe(response => {

        // Default
        this.character = this._dataSvc.characterData[0];

      });
    }

    this._dataSvc.getAllData().subscribe(response => {
      
      this.lifeEvents = _.filter(this._dataSvc.eventData, (e) => {return e.type === 'life'});
      this.effectEvents = _.filter(this._dataSvc.eventData, (e) => {return e.type === 'effect'});

      this.character = this._dataSvc.assignedChar;

    });

  }

  constructor(private router: Router, public _dataSvc: DataService) { 

    this.getData();

    this._dataSvc.playerDataUpdate.subscribe((data: PlayerData) => {

      this.character = this._dataSvc.assignedChar;
      this.surveyUrl = this._dataSvc.surveyUrl + '?priority=' + this._dataSvc.playerPriority;

      if(data.gameEnded) {
        
        this.gameEnded = true;
        this.currentWellnessScore = Math.round((data.wellnessScore / data.wellnessGoal) * data.wellnessGoal);
        if(this.currentWellnessScore > 100) this.currentWellnessScore = 100;

        this.wonGame = data.wellnessScore >= data.wellnessGoal;
        (<HTMLElement>document.querySelector('#game-over #inner')).style.width = (this.currentWellnessScore >= 96) ? '96' : this.currentWellnessScore + "%";

        this.lifeEvents = _.filter(this._dataSvc.getUpdatedEvents(), (e) => {return e.type === 'life'});
        
        let content = <HTMLElement>document.querySelector('#game-over #content');
        let charImg = <HTMLElement>document.querySelector('.character img');
        let radius = {val: 0};
        content.style.visibility = 'hidden';

        TweenLite.to(document.getElementById('wellbeing'), 1, {autoAlpha:0, display:'none'});
        TweenLite.fromTo(document.getElementById('game-over'), 2, {autoAlpha:0, top:'-100%'}, {autoAlpha:1, top:0, display:'block', ease:Sine.easeOut});
        TweenLite.to(content, 1, {autoAlpha:1, delay:2.1});

        TweenLite.fromTo(document.querySelector('#game-over #header'), .7, {autoAlpha:0, top:'-140px'}, {autoAlpha:1, top:0, delay:3.1, display:'block', ease:Back.easeOut});

        TweenMax.to(document.getElementById('circle'), 1, {attr:{r:45}, delay:4, ease:Back.easeOut});
        TweenMax.to(radius, 1, {val:66, delay:4.7, ease:Sine.easeOut, 
          onUpdate:() => {
           charImg.style.clipPath = 'circle('+radius.val+'% at 54% 43%)';
          }
        });
        TweenLite.fromTo(document.getElementById('wellbeing-score'), 1, {autoAlpha:0, top:'-100%'}, {autoAlpha:1, top:0, delay:5, display:'flex', ease:Back.easeOut});
        TweenLite.fromTo(document.getElementById('share'), 1, {autoAlpha:0, scale:0}, {autoAlpha:1, scale:1, delay:5.5, display:'block', ease:Elastic.easeOut});
        TweenLite.fromTo(document.getElementById('play-again'), 1, {autoAlpha:0, top:'-100%'}, {autoAlpha:1, top:0, delay:5.7, display:'inline-flex', ease:Sine.easeOut});


      }

    });

    this._dataSvc.effectTrigger.subscribe((events: any[]) => {

      if(!events || events.length < 1 || this.gameEnded) return;

      let effectEventSel = document.getElementById('effect-events');
      _.each(events, (event, i) => {

        let eventToShow = document.getElementById(event.id);
        
        // Only ever show one event at once
        if(eventToShow === undefined || eventToShow === null || i > 0) {
          if(eventToShow !== undefined)
            eventToShow.classList.add('queue');
        }
        else {
          TweenLite.to(effectEventSel, 1, {autoAlpha: 1, display:'block'});
          TweenLite.to(eventToShow, 1, {autoAlpha:1, display:'block'});
        }

      });

    });

    this._dataSvc.lifeEventTrigger.subscribe(() => {

      if(this.gameEnded) return;

      // Show only if any left
      let allEvents = document.querySelectorAll('#life-events .game-event');
      if(allEvents.length > 0) {
  
        let eventIndex = Math.floor(Math.random() * ((allEvents.length-1) - 0 + 1));
        // debugger;
        let eventEl = allEvents[eventIndex];
        
        if(eventEl === undefined) return;

        TweenLite.to(document.getElementById('life-events'), 1, {autoAlpha: 1, display:'block'});
        TweenLite.to(eventEl, 1, {autoAlpha:1, display:'block'});
        
      }
    });

    router.events.subscribe((val) =>  {

      if(this.gameEnded) return;

      if(val instanceof NavigationEnd) {
        
        if(val.url.indexOf("/game/home") > -1) {
          TweenLite.to(document.getElementById('toolbar-parent'), 1, {autoAlpha: 1, display:'block'});
          TweenLite.to(document.getElementById('wellbeing'), 1, {autoAlpha: 1, display:'block'});

          this.atHome = true;
        }
        
      }
      
    });

  }

  ngOnInit() {

  }

  closeCheevo() {

    TweenLite.to(document.getElementById('achievement'), 1, {autoAlpha: 0, display:'none'});

  }

  removeEvent(eventId: string) {

    let thisEl = document.getElementById('event_'+eventId);
    TweenLite.to(thisEl, 1, {autoAlpha: 0, display:'none', oncomplete: () => {
      
      thisEl.parentNode.removeChild(thisEl);

      TweenLite.to(document.getElementById('life-events'), 1, {autoAlpha: 0, display:'none'});
      this._dataSvc.removeEvent(eventId);

    }});
    
  }

  selectNo(eventId: string) {

    this.removeEvent(eventId);
    this._dataSvc.removeEvent(eventId);

  }
 
  selectYes(eventId: string) {
   
    this._dataSvc.updateStats(this._dataSvc.getEventById(eventId));
    this.removeEvent(eventId);

  }

  startOver() {

    window.location.href = '/';

  }

}
