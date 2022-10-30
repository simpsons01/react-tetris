export const PER_COL_CUBE_NUM = 10;

export const PER_ROW_CUBE_NUM = 40;

export const DEFAULT_START_LEVEL = 0;

export const BUFFER_ZONE_ROW_START = 0;

export const BUFFER_ZONE_ROW_END = 19;

export const DISPLAY_ZONE_ROW_START = 20;

export const DISPLAY_ZONE_ROW_END = 39;

export const getLevelByLine = (line: number): number => Math.floor(line / 10);

export const getTetriminoFallingDelayByLevel = (level: number) => {
  const sec = {
    "0": 1000,
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

export const getScoreByLevelAndLine = (level: number, line: number): number => {
  let score = 0;
  const magnification = level + 1;
  if (line === 1) {
    score = 40 * magnification;
  } else if (line === 2) {
    score = 100 * magnification;
  } else if (line === 3) {
    score = 300 * magnification;
  } else if (line === 4) {
    score = 1200 * magnification;
  }
  return score;
};
