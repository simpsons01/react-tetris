import { BasePanel, IPanel } from "./Base";
import { useSizeConfigContext } from "../../../context/sizeConfig";
import Font from "../../Font";
export interface IPause extends IPanel {
  isPausing: boolean;
}

const Pause = (props: IPause): JSX.Element | null => {
  const { isPausing } = props;
  const sizeConfigContext = useSizeConfigContext();

  if (!isPausing) return null;
  return (
    <BasePanel>
      <Font fontSize={sizeConfigContext.font.level.three} color={"#fff"}>
        PAUSE
      </Font>
    </BasePanel>
  );
};

export default Pause;
