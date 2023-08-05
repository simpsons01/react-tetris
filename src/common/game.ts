import { T_SPIN_TYPE } from "./tetrimino";

export enum SCORE_TYPE {
  SINGLE,
  DOUBLE,
  TRIPLE,
  TETRIS,
  MINI_T_SPIN,
  T_SPIN,
  MINI_T_SPIN_SINGLE,
  T_SPIN_SINGLE,
  MINI_T_SPIN_DOUBLE,
  T_SPIN_DOUBLE,
}

export const getLevel = (line: number, level: number): number => {
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

export const getScoreTypeIsDifficult = (scoreType: SCORE_TYPE) => {
  return (
    scoreType === SCORE_TYPE.TETRIS ||
    scoreType === SCORE_TYPE.T_SPIN_SINGLE ||
    scoreType === SCORE_TYPE.T_SPIN_DOUBLE ||
    scoreType === SCORE_TYPE.MINI_T_SPIN_SINGLE ||
    scoreType === SCORE_TYPE.MINI_T_SPIN_DOUBLE
  );
};

export const getScoreType = (tSpin: null | T_SPIN_TYPE, line: number): SCORE_TYPE => {
  let scoreType: SCORE_TYPE;
  if (tSpin) {
    if (tSpin === T_SPIN_TYPE.NORMAL) {
      if (line === 0) {
        scoreType = SCORE_TYPE.T_SPIN;
      } else if (line === 1) {
        scoreType = SCORE_TYPE.T_SPIN_SINGLE;
      } else {
        scoreType = SCORE_TYPE.T_SPIN_DOUBLE;
      }
    } else {
      if (line === 1) {
        scoreType = SCORE_TYPE.MINI_T_SPIN_SINGLE;
      } else {
        scoreType = SCORE_TYPE.MINI_T_SPIN;
      }
    }
  } else {
    if (line === 1) {
      scoreType = SCORE_TYPE.SINGLE;
    } else if (line === 2) {
      scoreType = SCORE_TYPE.DOUBLE;
    } else if (line === 3) {
      scoreType = SCORE_TYPE.TRIPLE;
    } else {
      scoreType = SCORE_TYPE.TETRIS;
    }
  }
  return scoreType;
};

export const getScoreTextByScoreType = (scoreType: SCORE_TYPE): string => {
  const scoreText = {
    [SCORE_TYPE.SINGLE]: "SINGLE",
    [SCORE_TYPE.DOUBLE]: "DOUBLE",
    [SCORE_TYPE.TRIPLE]: "TRIPLE",
    [SCORE_TYPE.TETRIS]: "TETRIS!",
    [SCORE_TYPE.MINI_T_SPIN]: "MINI T-SPIN",
    [SCORE_TYPE.T_SPIN]: "T-SPIN",
    [SCORE_TYPE.MINI_T_SPIN_SINGLE]: "MINI T-SPIN SINGLE!",
    [SCORE_TYPE.T_SPIN_SINGLE]: "T-SPIN SINGLE!",
    [SCORE_TYPE.MINI_T_SPIN_DOUBLE]: "MINI T-SPIN DOUBLE!",
    [SCORE_TYPE.T_SPIN_DOUBLE]: "T-SPIN TRIPLE!",
  };
  return scoreText[scoreType];
};

export const getScore = (
  tSpin: null | T_SPIN_TYPE,
  level: number,
  line: number,
  combo: number,
  isBackToBack: boolean
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
  const actionScore = base * level * (isBackToBack ? 1.5 : 1);
  const comboScore = 50 * (combo === -1 ? 0 : combo) * level;
  return actionScore + comboScore;
};
