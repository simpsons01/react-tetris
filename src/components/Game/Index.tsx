import React from "react";

export interface IGame {}

const Game: React.FC<IGame> = function (props) {
  return <div className="game"></div>;
};

export default Game;
