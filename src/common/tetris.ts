export const PER_COL_CUBE_NUM = 10;

export const PER_ROW_CUBE_NUM = 40;

export const DEFAULT_START_LEVEL = 0;

export const BUFFER_ZONE_ROW_START = 0;

export const BUFFER_ZONE_ROW_END = 19;

export const DISPLAY_ZONE_ROW_START = 20;

export const DISPLAY_ZONE_ROW_END = 39;

export const getLevelByLine = (line: number): number => Math.floor(line / 10);

export const getTetriminoFallingDelayByLevel = (level: number) => {
  const frame = (() => {
    const _: { [key: string]: number } = {
      "0": 48,
      "1": 43,
      "2": 38,
      "3": 33,
      "4": 28,
      "5": 23,
      "6": 18,
      "7": 13,
      "8": 8,
      "9": 6,
      "10": 5,
      "11": 5,
      "12": 5,
      "13": 4,
      "14": 4,
      "15": 4,
      "16": 3,
      "17": 3,
      "18": 3,
      "19": 2,
      "20": 2,
      "21": 2,
      "22": 2,
      "23": 2,
      "24": 2,
      "25": 2,
      "26": 2,
      "27": 2,
      "28": 2,
      "29": 1,
    };
    return _[`${level}`] ?? 1;
  })();
  return Math.floor(frame * (1 / 60) * 1000);
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
