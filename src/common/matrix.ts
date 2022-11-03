import { T_SPIN_TYPE } from "./tetrimino";

export const PER_COL_CUBE_NUM = 10;

export const PER_ROW_CUBE_NUM = 40;

export const DEFAULT_START_LEVEL = 1;

export const BUFFER_ZONE_ROW_START = 0;

export const BUFFER_ZONE_ROW_END = 19;

export const DISPLAY_ZONE_ROW_START = 20;

export const DISPLAY_ZONE_ROW_END = 39;

export const getLevelByLine = (line: number): number => DEFAULT_START_LEVEL + Math.floor(line / 10);

export const getTetriminoFallingDelayByLevel = (level: number) => {
  const sec = {
    "1": 1000,
    "2": 793,
    "3": 618,
    "4": 473,
    "5": 355,
    "6": 262,
    "7": 190,
    "8": 135,
    "9": 94,
    "10": 64,
    "11": 43,
    "12": 28,
    "13": 18,
    "14": 11,
    "15": 7,
  }[level];
  return sec ?? 7;
};

export const getScoreTextByTSpinAndLine = (tSpin: null | T_SPIN_TYPE, line: number): string => {
  let text = "";
  if (tSpin) {
    if (tSpin === T_SPIN_TYPE.NORMAL) {
      if (line === 0) {
        text = "T-Spin";
      } else if (line === 1) {
        text = "T-Spin Single";
      } else if (line === 2) {
        text = "T-Spin Double";
      } else if (line === 3) {
        text = "T-Spin Triple";
      }
    } else {
      if (line === 1) {
        text = "Mini T-Spin Single";
      } else {
        text = "Mini T-Spin";
      }
    }
  } else {
    if (line === 1) {
      text = "Single";
    } else if (line === 2) {
      text = "Double";
    } else if (line === 3) {
      text = "Triple";
    } else if (line === 4) {
      text = "Tetris";
    }
  }
  return text + "!";
};

export const getScoreByTSpinAndLevelAndLine = (
  tSpin: null | T_SPIN_TYPE,
  level: number,
  line: number
): number => {
  let base = 0;
  if (tSpin) {
    if (tSpin === T_SPIN_TYPE.NORMAL) {
      if (line === 0) {
        base = 400;
      } else if (line === 1) {
        base = 800;
      } else if (line === 2) {
        base = 1200;
      } else if (line === 3) {
        base = 1600;
      }
    } else {
      if (line === 1) {
        base = 100;
      } else {
        base = 800;
      }
    }
  } else {
    if (line === 1) {
      base = 100;
    } else if (line === 2) {
      base = 300;
    } else if (line === 3) {
      base = 500;
    } else if (line === 4) {
      base = 800;
    }
  }
  return base * level;
};
