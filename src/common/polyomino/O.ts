import { POLYOMINO_SHAPE } from "./_type";

export const O = {
  config: {
    [POLYOMINO_SHAPE.INITIAL]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: 0, y: -1 },
          { x: 1, y: -1 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      boundary: {
        size: 3,
        position: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
    },
    [POLYOMINO_SHAPE.RIGHT]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: 0, y: -1 },
          { x: 1, y: -1 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      boundary: {
        size: 3,
        position: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
    },
    [POLYOMINO_SHAPE.TWICE]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: 0, y: -1 },
          { x: 1, y: -1 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      boundary: {
        size: 3,
        position: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
    },
    [POLYOMINO_SHAPE.LEFT]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: 0, y: -1 },
          { x: 1, y: -1 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      boundary: {
        size: 3,
        position: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
      },
    },
  },
  wallKick: {
    [`${POLYOMINO_SHAPE.INITIAL}-${POLYOMINO_SHAPE.RIGHT}`]: [],
    [`${POLYOMINO_SHAPE.RIGHT}-${POLYOMINO_SHAPE.INITIAL}`]: [],
    [`${POLYOMINO_SHAPE.RIGHT}-${POLYOMINO_SHAPE.TWICE}`]: [],
    [`${POLYOMINO_SHAPE.TWICE}-${POLYOMINO_SHAPE.RIGHT}`]: [],
    [`${POLYOMINO_SHAPE.TWICE}-${POLYOMINO_SHAPE.LEFT}`]: [],
    [`${POLYOMINO_SHAPE.LEFT}-${POLYOMINO_SHAPE.TWICE}`]: [],
    [`${POLYOMINO_SHAPE.LEFT}-${POLYOMINO_SHAPE.INITIAL}`]: [],
    [`${POLYOMINO_SHAPE.INITIAL}-${POLYOMINO_SHAPE.LEFT}`]: [],
  },
};
