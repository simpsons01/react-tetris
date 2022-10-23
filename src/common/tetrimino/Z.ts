import { TETRIMINO_SHAPE } from "./_type";

export const Z = {
  config: {
    [TETRIMINO_SHAPE.INITIAL]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: -1, y: -1 },
          { x: 0, y: -1 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      boundary: {
        size: 3,
        position: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ],
      },
    },
    [TETRIMINO_SHAPE.RIGHT]: {
      shape: {
        anchorIndex: 1,
        coordinates: [
          { x: 1, y: -1 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
      },
      boundary: {
        size: 3,
        position: [
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 1, y: 2 },
        ],
      },
    },
    [TETRIMINO_SHAPE.TWICE]: {
      shape: {
        anchorIndex: 1,
        coordinates: [
          { x: -1, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
      boundary: {
        size: 3,
        position: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
        ],
      },
    },
    [TETRIMINO_SHAPE.LEFT]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: 0, y: -1 },
          { x: -1, y: 0 },
          { x: 0, y: 0 },
          { x: -1, y: 1 },
        ],
      },
      boundary: {
        size: 3,
        position: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 0, y: 2 },
        ],
      },
    },
  },
  wallKick: {
    [`${TETRIMINO_SHAPE.INITIAL}-${TETRIMINO_SHAPE.RIGHT}`]: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
    [`${TETRIMINO_SHAPE.RIGHT}-${TETRIMINO_SHAPE.INITIAL}`]: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
    [`${TETRIMINO_SHAPE.RIGHT}-${TETRIMINO_SHAPE.TWICE}`]: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
    [`${TETRIMINO_SHAPE.TWICE}-${TETRIMINO_SHAPE.RIGHT}`]: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
    [`${TETRIMINO_SHAPE.TWICE}-${TETRIMINO_SHAPE.LEFT}`]: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    [`${TETRIMINO_SHAPE.LEFT}-${TETRIMINO_SHAPE.TWICE}`]: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: -1, y: -2 },
    ],
    [`${TETRIMINO_SHAPE.LEFT}-${TETRIMINO_SHAPE.INITIAL}`]: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: -1, y: -2 },
    ],
    [`${TETRIMINO_SHAPE.INITIAL}-${TETRIMINO_SHAPE.LEFT}`]: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  },
  spawnStartLocation: {
    x: 4,
    y: 19,
  },
};
