import { Vec2, EntityType, Task } from '../types/common';
import { Entity } from './Entity';

export class LivingEntity extends Entity {
  health: number;
  maxHealth: number;
  speed: number;
  visionRange: number;
  attackRange: number;
  damage: number;
  faction: 'player' | 'neutral' | 'enemy';
  targetEntity: Entity | null = null;
  attackCooldown: number = 0;
  attackSpeed: number = 1;
  task: Task = 'idle';

  constructor(
    position: Vec2,
    type: EntityType,
    width: number,
    height: number,
    health: number,
    speed: number,
    visionRange: number,
    attackRange: number,
    damage: number,
    faction: 'player' | 'neutral' | 'enemy'
  ) {
    super(position, type, width, height);
    this.health = health;
    this.maxHealth = health;
    this.speed = speed;
    this.visionRange = visionRange;
    this.attackRange = attackRange;
    this.damage = damage;
    this.faction = faction;
  }

  setTask(task: Task): void {
    this.task = task;
  }

  get hpPercent(): number {
    return this.health / this.maxHealth;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  distanceTo(other: Entity): number {
    const dx = this.center.x - other.center.x;
    const dy = this.center.y - other.center.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isInRange(other: Entity): boolean {
    return this.distanceTo(other) <= this.attackRange;
  }

  canSee(other: Entity): boolean {
    return this.distanceTo(other) <= this.visionRange;
  }

  updateCooldowns(dt: number): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  performAttack(target: LivingEntity): void {
    if (this.canAttack()) {
      target.takeDamage(this.damage);
      this.attackCooldown = 1 / this.attackSpeed;
    }
  }
}