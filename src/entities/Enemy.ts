import { Vec2, Temperament, CombatStyle } from '../types/common';
import { LivingEntity } from './LivingEntity';

export class Enemy extends LivingEntity {
  enemyType: string;
  temperament: Temperament;
  combatStyle: CombatStyle;
  wanderTarget: Vec2 | null = null;
  wanderTimer: number = 0;
  homePosition: Vec2;
  state: 'wandering' | 'chasing' | 'returning' = 'wandering';

  constructor(
    position: Vec2,
    enemyType: string,
    health: number,
    speed: number,
    visionRange: number,
    attackRange: number,
    damage: number,
    temperament: Temperament,
    combatStyle: CombatStyle
  ) {
    super(position, 'enemy', 15, 15, health, speed, visionRange, attackRange, damage, 'enemy');
    this.enemyType = enemyType;
    this.temperament = temperament;
    this.combatStyle = combatStyle;
    this.homePosition = { x: position.x, y: position.y };
  }
}