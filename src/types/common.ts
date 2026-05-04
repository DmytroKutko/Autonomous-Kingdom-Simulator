export interface Vec2 {
  x: number;
  y: number;
}

export type Faction = 'player' | 'neutral' | 'enemy';

export type EntityType = 'unit' | 'enemy' | 'base' | 'resourceNode' | 'droppedItem';

export type Task = 'idle' | 'gathering' | 'fighting' | 'returning' | 'healing' | 'exploring' | 'moving_to_resource' | 'moving_to_target' | 'wandering';

export type ResourceType = 'wood' | 'food';

export type Temperament = 'passive' | 'aggressive' | 'defensive';

export type CombatStyle = 'melee' | 'ranged';

export interface EntityConfig {
  health: number;
  speed: number;
  visionRange: number;
  attackRange: number;
  damage: number;
}

export interface UnitConfig extends EntityConfig {
  inventoryCapacity: number;
  temperament: Temperament;
  combatStyle: CombatStyle;
}

export interface EnemyConfig extends EntityConfig {
  temperament: Temperament;
  combatStyle: CombatStyle;
  loot?: {
    resourceType: ResourceType;
    amount: number;
    dropChance: number;
  };
}

export interface ResourceConfig {
  resourceType: ResourceType;
  amount: number;
  respawnTime: number;
}