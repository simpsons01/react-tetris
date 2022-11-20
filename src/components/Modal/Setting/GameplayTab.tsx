import { FC } from "react";
import styled from "styled-components";
import { TOTAL_LEVEL } from "../../../common/matrix";
import { ISetting } from "../../../hooks/setting";
import Font from "../../Font";

const Wrapper = styled.div``;

const Title = styled.div`
  margin-bottom: 12px;
`;

const TableWrapper = styled.div`
  padding: 0 16px;

  table {
    width: calc(100% - 8px);
    border-collapse: collapse;
    border-spacing: 0px;

    td {
      padding: 8px;
      border: 2px solid #212529;
    }
  }
`;

interface IGameplayTab {
  setting: ISetting["gameplay"];
  updateSetting: (setting: ISetting["gameplay"]) => void;
}

const GameplayTab: FC<IGameplayTab> = (props) => {
  const { setting, updateSetting } = props;

  return (
    <Wrapper>
      <div className="single">
        <Title>
          <Font level="five">SINGLE</Font>
        </Title>
        <TableWrapper>
          <table>
            <colgroup>
              <col style={{ width: "50%" }} />
              <col style={{ width: "50%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td>
                  <Font inline={true} level="six">
                    START LEVEL
                  </Font>
                </td>
                <td>
                  <div className="nes-select">
                    <select
                      value={setting.single.startLevel}
                      onChange={(event) => {
                        updateSetting({
                          ...setting,
                          single: {
                            ...setting.single,
                            startLevel: parseInt(event.target.value, 10),
                          },
                        });
                      }}
                    >
                      {(() => {
                        const options = [];
                        let level = 1;
                        while (level <= TOTAL_LEVEL) {
                          options.push(
                            <option key={level} value={level}>
                              {level}
                            </option>
                          );
                          level += 1;
                        }
                        return options;
                      })()}
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
      </div>
    </Wrapper>
  );
};

export default GameplayTab;
