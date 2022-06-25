import React from "react";

export interface INext {}

const Next: React.FC<INext> = function (props) {
  return <div className="next-cube"></div>;
};

export default Next;
