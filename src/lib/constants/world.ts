import Victor from 'victor';

// Container dimensions
export const CONTAINER_WIDTH = 800;
export const CONTAINER_HEIGHT = 600;
export const FRICTION_SINGLETON = 0.9;
export const FRICTION = new Victor(FRICTION_SINGLETON, FRICTION_SINGLETON);
