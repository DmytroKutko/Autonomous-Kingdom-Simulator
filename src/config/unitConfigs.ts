import { UnitConfig } from '../types/common';

export const unitConfigs: Record<string, UnitConfig> = {
  warrior: {
    health: 100,
    speed: 1.5,
    visionRange: 150,
    attackRange: 30,
    damage: 15,
    inventoryCapacity: 3,
    temperament: 'aggressive',
    combatStyle: 'melee'
  }
};