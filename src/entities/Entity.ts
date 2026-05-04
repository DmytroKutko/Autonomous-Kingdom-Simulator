import { Vec2, EntityType } from '../types/common';

export class Entity {
  id: number;
  position: Vec2;
  type: EntityType;
  width: number;
  height: number;
  static nextId = 1;

  constructor(position: Vec2, type: EntityType, width: number, height: number) {
    this.id = Entity.nextId++;
    this.position = position;
    this.type = type;
    this.width = width;
    this.height = height;
  }

  get center(): Vec2 {
    return {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };
  }
}