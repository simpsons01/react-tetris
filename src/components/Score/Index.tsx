import React from "react";

export interface IScore {}

const Score: React.FC<IScore> = function (props) {
  return <div className="score"></div>;
};

export default Score;
