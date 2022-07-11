import { BasePanel, BasePanelText, IPanel } from "./Base";

export interface IPause extends IPanel {
  isPausing: boolean;
}

const Pause = (props: IPause): JSX.Element | null => {
  const { fontSize, isPausing } = props;
  if (!isPausing) return null;
  return (
    <BasePanel>
      <BasePanelText fontSize={fontSize}>PAUSE</BasePanelText>
    </BasePanel>
  );
};

export default Pause;
