import { Unit, ResourceNode, Base } from '../entities';
import { canReach, moveToward } from './MovementLogic';

export const findNearestResource = (
  unit: Unit, 
  nodes: ResourceNode[]
): ResourceNode | null => {
  let nearest: ResourceNode | null = null;
  let minDist = Infinity;
  
  for (const node of nodes) {
    if (node.isDepleted) continue;
    const d = unit.distanceTo(node);
    if (d < minDist) {
      minDist = d;
      nearest = node;
    }
  }
  
  return nearest;
};

export const depositResources = (
  unit: Unit, 
  base: Base
): boolean => {
  if (!canReach(unit, base.center, 50)) {
    moveToward(unit, base.center, unit.speed);
    return false;
  }
  
  unit.inventory.forEach((amount, type) => {
    if (amount > 0) {
      console.log('Deposited', type, amount);
      base.addResource(type as 'wood' | 'food', amount);
    }
  });
  unit.clearInventory();
  return true;
};