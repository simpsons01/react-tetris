export interface ISizeConfig {
  playable: boolean;
}

export const getScreenSize = () => {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const screenHeight =
    window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  return {
    width: screenWidth,
    height: screenHeight,
  };
};

export const MAX_PLAYABLE_RATIO = 11 / 16;
