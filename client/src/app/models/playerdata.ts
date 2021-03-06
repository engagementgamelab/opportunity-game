import { Ranks } from './ranks';

export interface PlayerData {

	round: number;
	money: number;
	actions: number;
	commLevel: number;
	jobLevel: number;
	englishLevel: number;
	character: Ranks;
  
  hasTransit?: boolean;
  hasJob?: boolean;
  
  wellnessScore?: number;
  wellnessGoal?: number;
  
  // Internal flags
  gameEnded?: boolean;
  gotTransit?: boolean;
  gotJob?: boolean;
  payday?: boolean;
  metGoals?: boolean;

  sawTutorial?: boolean;
  sawCityIntro?: boolean;

}
