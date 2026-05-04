import { Vec2 } from '../types/common';
import { LivingEntity } from '../entities';

export const distance = (a: Vec2, b: Vec2): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const moveToward = (entity: LivingEntity, target: Vec2, dt: number): void => {
  const d = distance(entity.center, target);
  if (d < 5) return;
  
  const dx = target.x - entity.center.x;
  const dy = target.y - entity.center.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  
  entity.position.x += (dx / len) * entity.speed * dt * 60;
  entity.position.y += (dy / len) * entity.speed * dt * 60;
};

export const canReach = (entity: LivingEntity, target: Vec2, maxRange: number = 5): boolean => {
  return distance(entity.center, target) <= maxRange;
};

export const findNearest = <T extends { center: Vec2 }>(entity: LivingEntity, entities: T[]): T | null => {
  let nearest: T | null = null;
  let minDist = Infinity;
  
  for (const e of entities) {
    if (entity.canSee(e as unknown as LivingEntity)) {
      const d = distance(entity.center, e.center);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    }
  }
  
  return nearest;
};