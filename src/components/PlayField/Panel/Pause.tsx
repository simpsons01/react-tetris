import { BasePanel, IPanel } from "./Base";
import Font from "../../Font";
import { FC } from "react";
export interface IPause extends IPanel {
  isPausing: boolean;
}

const Pause: FC<IPause> = (props) => {
  const { isPausing } = props;

  if (!isPausing) return null;
  return (
    <BasePanel>
      <Font level={"three"} color={"#fff"}>
        PAUSE
      </Font>
    </BasePanel>
  );
};

export default Pause;
