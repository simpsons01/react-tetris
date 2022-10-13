import { BasePanel, IPanel } from "./Base";
import Font from "../../Font";
export interface IPause extends IPanel {
  isPausing: boolean;
}

const Pause = (props: IPause): JSX.Element | null => {
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
