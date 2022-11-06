import { nanoid } from "nanoid";
import { FC, useState } from "react";
import styled from "styled-components";
import { useSettingModalVisibilityContext } from "../../context/settingModalVisibility";
import Font from "../Font";
import BaseModal, { IBaseModal } from "./Base";

const SettingModalBody = styled.div`
  padding: 16px;
  min-width: 600px;
`;

const SettingModalTab = styled.div`
  position: relative;
  z-index: 1;
  ul {
    padding: 0;
    margin: 0;

    list-style: none;
    display: flex;

    li {
      &::before {
        display: none !important;
      }

      button {
        padding: 8px 16px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;

        &.active {
          border-color: #212529;
          background-color: #212529;

          span {
            background-color: #212529;
          }
        }
      }
    }
  }
`;

const SettingModalTabWrapper = styled.div`
  padding: 16px;
  border: 2px solid #212529;
  margin-top: -2px;
`;

const SettingModalControlWrapper = styled.div`
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

const SettingModalGamePlayWrapper = styled.div`
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

const KeyBoardKey = styled.div`
  display: inline-block;
  background-color: #d2d2d2;
  position: relative;
  border-radius: 8px;
  padding: 4px 8px;
  margin: 0 5px 5px 0;

  transform-style: preserve-3d;

  &::before {
    position: absolute;
    border-radius: 8px;
    content: "";
    display: block;
    left: -2px;
    top: -5px;
    right: 0;
    bottom: 0;
    background-color: #7e7e7e;
    transform: translate(5px, 5px) translateZ(-1px);
  }
`;

enum TAB {
  CONTROL = "CONTROL",
  GAMEPLAY = "GAMEPLAY",
}

const tabs = [
  { tab: TAB.CONTROL, label: "CONTROL" },
  { tab: TAB.GAMEPLAY, label: "GAMEPLAY" },
].map((_) => ({ ..._, id: nanoid() }));

export interface ISettingModal extends IBaseModal {}

const Setting: FC<ISettingModal> = (props) => {
  const { isOpen } = props;

  const { close: closeSettingModal } = useSettingModalVisibilityContext();

  const [tab, setTab] = useState(TAB.CONTROL);

  let modalTabContent;

  if (tab === TAB.CONTROL) {
    modalTabContent = (
      <SettingModalControlWrapper>
        <table>
          <colgroup>
            <col style={{ width: "50%" }} />
            <col style={{ width: "50%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td>
                <Font inline={true} level="six">
                  LEFT
                </Font>
              </td>
              <td>
                <KeyBoardKey>
                  <Font inline={true} level="six">
                    ARROW LEFT
                  </Font>
                </KeyBoardKey>
              </td>
            </tr>
            <tr>
              <td>
                <Font inline={true} level="six">
                  RIGHT
                </Font>
              </td>
              <td>
                <KeyBoardKey>
                  <Font inline={true} level="six">
                    ARROW RIGHT
                  </Font>
                </KeyBoardKey>
              </td>
            </tr>
            <tr>
              <td>
                <Font inline={true} level="six">
                  ROTATION(CLOCKWISE)
                </Font>
              </td>
              <td>
                <KeyBoardKey>
                  <Font inline={true} level="six">
                    ARROW UP
                  </Font>
                </KeyBoardKey>
              </td>
            </tr>
            <tr>
              <td>
                <Font inline={true} level="six">
                  ROTATION(COUNTER CLOCKWISE)
                </Font>
              </td>
              <td>
                <KeyBoardKey>
                  <Font inline={true} level="six">
                    Z
                  </Font>
                </KeyBoardKey>
              </td>
            </tr>
            <tr>
              <td>
                <Font inline={true} level="six">
                  SOFT DROP
                </Font>
              </td>
              <td>
                <KeyBoardKey>
                  <Font inline={true} level="six">
                    ARROW DOWN
                  </Font>
                </KeyBoardKey>
              </td>
            </tr>
            <tr>
              <td>
                <Font inline={true} level="six">
                  HARD DROP
                </Font>
              </td>
              <td>
                <KeyBoardKey>
                  <Font inline={true} level="six">
                    SPACE BAR
                  </Font>
                </KeyBoardKey>
              </td>
            </tr>
            <tr>
              <td>
                <Font inline={true} level="six">
                  HOLD
                </Font>
              </td>
              <td>
                <KeyBoardKey>
                  <Font inline={true} level="six">
                    SHIFT
                  </Font>
                </KeyBoardKey>
              </td>
            </tr>
          </tbody>
        </table>
      </SettingModalControlWrapper>
    );
  } else {
    modalTabContent = (
      <SettingModalGamePlayWrapper>
        <div>
          <Font level="five">SINGLE</Font>
        </div>
      </SettingModalGamePlayWrapper>
    );
  }

  if (!isOpen) return null;
  return (
    <BaseModal
      title={
        <Font level={"four"} align={"center"}>
          SETTING
        </Font>
      }
      body={
        <SettingModalBody>
          <SettingModalTab>
            <ul>
              {tabs.map((_tab) => {
                const isActive = _tab.tab === tab;
                return (
                  <li>
                    <button onClick={() => setTab(_tab.tab)} className={isActive ? "active" : ""}>
                      <Font color={isActive ? "#fff" : "#292929"} inline={true} level="five">
                        {_tab.label}
                      </Font>
                    </button>
                  </li>
                );
              })}
            </ul>
          </SettingModalTab>
          <SettingModalTabWrapper>{modalTabContent}</SettingModalTabWrapper>
        </SettingModalBody>
      }
      isOpen={isOpen}
      onCloseBtnClick={closeSettingModal}
    />
  );
};

export default Setting;
