import { ReactNode } from "react";

export interface IGame {
  score: (fontSize: number) => ReactNode;
  tetris: (cubeDistance: number) => ReactNode;
  next: (cubeDistance: number) => ReactNode;
}
