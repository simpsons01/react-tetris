import { nanoid } from "nanoid";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { useSettingContext } from "../../../context/setting";
import { useSettingModalVisibilityContext } from "../../../context/settingModalVisibility";
import { createDefaultSetting } from "../../../hooks/setting";
import Font from "../../Font";
import BaseModal, { IBaseModal } from "../Base";
import ControlTab from "./ControlTab";
import GameplayTab from "./GameplayTab";

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

  const [modalTempSetting, setModalTempSetting] = useState(createDefaultSetting());

  const { setting, updateSetting } = useSettingContext();

  const [tab, setTab] = useState(TAB.CONTROL);

  useEffect(() => {
    if (isOpen) {
      setModalTempSetting(setting);
    }
  }, [setting, isOpen]);

  let modalTabContent;
  if (tab === TAB.CONTROL) {
    modalTabContent = <ControlTab key={TAB.CONTROL} />;
  } else {
    modalTabContent = (
      <GameplayTab
        key={TAB.GAMEPLAY}
        setting={modalTempSetting.gameplay}
        updateSetting={(gamePlaySetting) => {
          setModalTempSetting((prevModalTempSetting) => ({
            ...prevModalTempSetting,
            gameplay: {
              ...prevModalTempSetting.gameplay,
              ...gamePlaySetting,
            },
          }));
        }}
      />
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
                  <li key={_tab.tab}>
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
      cancel={{
        onClick: () => {
          closeSettingModal();
        },
      }}
      confirm={{
        onClick: () => {
          closeSettingModal();
          updateSetting(modalTempSetting);
        },
      }}
    />
  );
};

export default Setting;
