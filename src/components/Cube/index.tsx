import { Cube as BaseCube } from "./Base";
import { ICube } from "./ICube";
import { JCube } from "./JCube";
import { LCube } from "./LCube";
import { OCube } from "./OCube";
import { SCube } from "./SCube";
import { ZCube } from "./ZCube";
import { TCube } from "./TCube";

const Cube = {
  Base: BaseCube,
  I: ICube,
  J: JCube,
  L: LCube,
  O: OCube,
  S: SCube,
  Z: ZCube,
  T: TCube,
};

export default Cube;
