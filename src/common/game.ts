import { T_SPIN_TYPE } from "./tetrimino";

export const getLevelByLine = (line: number, level: number): number => {
  const calcLevel = 1 + Math.floor(line / 10);
  return level > calcLevel ? level : calcLevel;
};

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
        text = "T-SPIN";
      } else if (line === 1) {
        text = "T-SPIN SINGLE";
      } else if (line === 2) {
        text = "T-SPIN DOUBLE!";
      } else if (line === 3) {
        text = "T-SPIN TRIPLE!";
      }
    } else {
      if (line === 1) {
        text = "MINI T-SPIN SINGLE";
      } else {
        text = "MINI T-SPIN";
      }
    }
  } else {
    if (line === 1) {
      text = "SINGLE";
    } else if (line === 2) {
      text = "DOUBLE";
    } else if (line === 3) {
      text = "TRIPLE!";
    } else if (line === 4) {
      text = "TETRIS!";
    }
  }
  return text;
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
