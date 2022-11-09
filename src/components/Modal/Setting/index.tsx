import { nanoid } from "nanoid";
import { AnyFunction } from "ramda";
import { FC, Fragment, useEffect, useState, ChangeEvent } from "react";
import styled from "styled-components";
import { useSettingContext } from "../../../context/setting";
import { useSettingModalVisibilityContext } from "../../../context/settingModalVisibility";
import useCustomRef from "../../../hooks/customRef";
import { createDefaultSetting } from "../../../hooks/setting";
import Font from "../../Font";
import BaseModal, { IBaseModal } from "../Base";
import ControlTab from "./ControlTab";
import GameplayTab from "./GameplayTab";

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

const NOT_SHOW_ALERT_MODAL_AGAIN_KEY = "notShowAlertModalAgain";

export interface ISettingModal extends IBaseModal {}

const Setting: FC<ISettingModal> = (props) => {
  const { isOpen } = props;

  const { settingRef, saveSetting } = useSettingContext();

  const { close: closeSettingModal } = useSettingModalVisibilityContext();

  const [modalTempSetting, setModalTempSetting] = useState(createDefaultSetting());

  const [isSettingAlertModalShow, setIsSettingAlertModalShow] = useState(false);

  const [isSettingAlertModalShowNoMore, setIsSettingAlertModalShowNoMore] = useState(() => {
    try {
      const valFromLocalStorage = localStorage.getItem(NOT_SHOW_ALERT_MODAL_AGAIN_KEY);
      return valFromLocalStorage ? JSON.parse(valFromLocalStorage) : false;
    } catch {
      return false;
    }
  });

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
      setModalTempSetting(settingRef.current);
    } else {
      setIsUpdatedModalSettingRef(false);
    }
  }, [isOpen, settingRef, setIsUpdatedModalSettingRef]);

  let modalTabContent;
  if (tab === TAB.CONTROL) {
    modalTabContent = <ControlTab />;
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
            saveSetting(modalTempSetting);
            if (isUpdatedModalSettingRef.current && !isSettingAlertModalShowNoMore) {
              setIsSettingAlertModalShow(true);
            } else {
              closeSettingModal();
            }
          },
        }}
      />
      <BaseModal
        isOpen={isSettingAlertModalShow}
        body={
          <div>
            <Font level="four">Updated setting will take effect when you visit website next time</Font>
            <div
              style={{
                marginTop: "16px",
              }}
            >
              <label>
                <input
                  checked={isSettingAlertModalShowNoMore}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setIsSettingAlertModalShowNoMore(event.target.checked);
                    if (event.target.checked) {
                      localStorage.setItem(NOT_SHOW_ALERT_MODAL_AGAIN_KEY, "true");
                    } else {
                      localStorage.removeItem(NOT_SHOW_ALERT_MODAL_AGAIN_KEY);
                    }
                  }}
                  className="nes-checkbox"
                  type="checkbox"
                />
                <span>Don't show anymore</span>
              </label>
            </div>
          </div>
        }
        cancel={{
          onClick: () => {
            closeSettingModal();
            setIsSettingAlertModalShow(false);
          },
        }}
        confirm={{
          text: "RELOAD NOW!",
          onClick: () => {
            window.location.reload();
          },
        }}
      />
    </Fragment>
  );
};

export default Setting;
