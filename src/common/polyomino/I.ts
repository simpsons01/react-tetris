import { POLYOMINO_SHAPE } from "./_type";

export const I = {
  config: {
    [POLYOMINO_SHAPE.INITIAL]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: -2, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      boundary: {
        size: 4,
        position: [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
        ],
      },
    },
    [POLYOMINO_SHAPE.RIGHT]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: 0, y: -2 },
          { x: 0, y: -1 },
          { x: 0, y: 0 },
          { x: 0, y: 1 },
        ],
      },
      boundary: {
        size: 4,
        position: [
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
      },
    },
    [POLYOMINO_SHAPE.TWICE]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: -2, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      boundary: {
        size: 4,
        position: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
        ],
      },
    },
    [POLYOMINO_SHAPE.LEFT]: {
      shape: {
        anchorIndex: 2,
        coordinates: [
          { x: 0, y: -2 },
          { x: 0, y: -1 },
          { x: 0, y: 0 },
          { x: 0, y: 1 },
        ],
      },
      boundary: {
        size: 4,
        position: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 1, y: 3 },
        ],
      },
    },
  },
  wallKick: {
    [`${POLYOMINO_SHAPE.INITIAL}-${POLYOMINO_SHAPE.RIGHT}`]: [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 1 },
      { x: 1, y: -2 },
    ],
    [`${POLYOMINO_SHAPE.RIGHT}-${POLYOMINO_SHAPE.INITIAL}`]: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: -1 },
      { x: -1, y: 2 },
    ],
    [`${POLYOMINO_SHAPE.RIGHT}-${POLYOMINO_SHAPE.TWICE}`]: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: -2 },
      { x: 2, y: 1 },
    ],
    [`${POLYOMINO_SHAPE.TWICE}-${POLYOMINO_SHAPE.RIGHT}`]: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 2 },
      { x: -2, y: -1 },
    ],
    [`${POLYOMINO_SHAPE.TWICE}-${POLYOMINO_SHAPE.LEFT}`]: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: -1 },
      { x: -1, y: 2 },
    ],
    [`${POLYOMINO_SHAPE.LEFT}-${POLYOMINO_SHAPE.TWICE}`]: [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 1 },
      { x: 1, y: -2 },
    ],
    [`${POLYOMINO_SHAPE.LEFT}-${POLYOMINO_SHAPE.INITIAL}`]: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 2 },
      { x: -2, y: -1 },
    ],
    [`${POLYOMINO_SHAPE.INITIAL}-${POLYOMINO_SHAPE.LEFT}`]: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: -2 },
      { x: 2, y: 1 },
    ],
  },
};
