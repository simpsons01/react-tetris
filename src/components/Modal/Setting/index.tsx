import type { AnyFunction } from "../../../utils/common";
import type { FC } from "react";
import type { IBaseModal } from "../Base";
import styled from "styled-components";
import useCustomRef from "../../../hooks/customRef";
import BaseModal from "../Base";
import Font from "../../Font";
import ControlTab from "./ControlTab";
import GameplayTab from "./GameplayTab";
import { nanoid } from "nanoid";
import { Fragment, useEffect, useState } from "react";
import { useSettingContext } from "../../../context/setting";
import { useSettingModalVisibilityContext } from "../../../context/settingModalVisibility";
import { createDefaultSetting } from "../../../hooks/setting";

const SettingModalBody = styled.div`
  padding: 16px;
  min-width: 800px;
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

  const { setting, setSetting, saveSetting } = useSettingContext();

  const { close: closeSettingModal } = useSettingModalVisibilityContext();

  const [modalTempSetting, setModalTempSetting] = useState(createDefaultSetting());

  const [tab, setTab] = useState(TAB.CONTROL);

  const [isUpdatedModalSettingRef, setIsUpdatedModalSettingRef] = useCustomRef(false);

  const [withHandleIsUpdatedModalSettingToTrueRef] = useCustomRef((fn: AnyFunction) => {
    if (!isUpdatedModalSettingRef.current) {
      setIsUpdatedModalSettingRef(true);
    }
    fn();
  });

  useEffect(() => {
    if (isOpen) {
      setModalTempSetting(setting);
    } else {
      setIsUpdatedModalSettingRef(false);
    }
  }, [isOpen, setting, setIsUpdatedModalSettingRef]);

  let modalTabContent;
  if (tab === TAB.CONTROL) {
    modalTabContent = (
      <ControlTab
        setting={modalTempSetting.control}
        updateSetting={(controlSetting) => {
          withHandleIsUpdatedModalSettingToTrueRef.current(() => {
            setModalTempSetting((prevModalTempSetting) => ({
              ...prevModalTempSetting,
              control: {
                ...prevModalTempSetting.control,
                ...controlSetting,
              },
            }));
          });
        }}
      />
    );
  } else {
    modalTabContent = (
      <GameplayTab
        setting={modalTempSetting.gameplay}
        updateSetting={(gamePlaySetting) => {
          withHandleIsUpdatedModalSettingToTrueRef.current(() => {
            setModalTempSetting((prevModalTempSetting) => ({
              ...prevModalTempSetting,
              gameplay: {
                ...prevModalTempSetting.gameplay,
                ...gamePlaySetting,
              },
            }));
          });
        }}
      />
    );
  }

  if (!isOpen) return null;
  return (
    <Fragment>
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
            saveSetting(modalTempSetting);
            setSetting(modalTempSetting);
          },
        }}
      />
    </Fragment>
  );
};

export default Setting;
