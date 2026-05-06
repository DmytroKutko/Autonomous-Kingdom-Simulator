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

export const findNearestUnclaimedResource = (
  unit: Unit,
  nodes: ResourceNode[]
): ResourceNode | null => {
  let nearest: ResourceNode | null = null;
  let minDist = Infinity;

  for (const node of nodes) {
    if (node.isDepleted) continue;

    const claimingUnit = nodesToUnits.get(node);
    if (claimingUnit && claimingUnit !== unit) {
      const distToClaimer = claimingUnit.distanceTo(node);
      const distToMe = unit.distanceTo(node);
      
      if (distToMe >= distToClaimer * 0.8) {
        continue;
      }
    }

    const d = unit.distanceTo(node);
    if (d < minDist) {
      minDist = d;
      nearest = node;
    }
  }

  return nearest;
};

const nodesToUnits = new WeakMap<ResourceNode, Unit>();

export const claimResource = (unit: Unit, node: ResourceNode): boolean => {
  const currentClaimer = nodesToUnits.get(node);
  
  if (currentClaimer) {
    const distToClaimer = currentClaimer.distanceTo(node);
    const distToMe = unit.distanceTo(node);
    
    if (distToMe < distToClaimer * 0.8) {
      currentClaimer.targetResource = null;
      nodesToUnits.set(node, unit);
      unit.targetResource = node;
      return true;
    }
    return false;
  }
  
  nodesToUnits.set(node, unit);
  unit.targetResource = node;
  return true;
};

export const releaseResource = (unit: Unit): void => {
  if (unit.targetResource) {
    nodesToUnits.delete(unit.targetResource);
    unit.targetResource = null;
  }
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