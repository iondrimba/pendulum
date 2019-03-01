import RoundedBoxGeometry from '../vendor/roundedBox';

export default class Box {
  constructor() {
    this.geom = new RoundedBoxGeometry(1, 4, 1, .04, .4);
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
  }
}
