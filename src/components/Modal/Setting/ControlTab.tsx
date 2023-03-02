import type { FC, KeyboardEvent } from "react";
import type { ISetting } from "../../../utils/setting";
import styled from "styled-components";
import Font from "../../Font";
import useCustomRef from "../../../hooks/customRef";
import BaseModal from "../Base";
import * as KEYCODE from "keycode-js";
import { useCallback, useMemo, useState } from "react";
import { getKeys } from "../../../utils/common";
import { convertKeyboardEvtKeyToDisplayText } from "../../../utils/keyboard";
import { createAlertModal } from "../../../utils/alert";

const Wrapper = styled.div`
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

  &:hover {
    background-color: #e9e9e9;

    &::before {
      background-color: #c3bfbf;
    }
  }
`;

interface IGameplayTab {
  setting: ISetting["control"];
  updateSetting: (setting: ISetting["control"]) => void;
}
const ControlTab: FC<IGameplayTab> = (props) => {
  const { setting, updateSetting } = props;

  const [customControlKeyInputDomRef, setCustomControlKeyInputDomRef] = useCustomRef<HTMLInputElement | null>(
    null
  );

  const [customControlKeyInputVal, setCustomControlKeyInputVal] = useState("");

  const [isCustomControlKeyModalOpen, setIsCustomControlKeyModalOpen] = useState(false);

  const [updateCustomControlKeyRef, setUpdateCustomControlKeyRef] = useCustomRef<
    keyof ISetting["control"] | null
  >(null);

  const withCustomControlModalOpen = useCallback(
    (updateControlKey: keyof ISetting["control"]) => {
      return () => {
        setUpdateCustomControlKeyRef(updateControlKey);
        setIsCustomControlKeyModalOpen(true);
        setTimeout(() => {
          customControlKeyInputDomRef.current?.focus();
        });
      };
    },
    [setUpdateCustomControlKeyRef, customControlKeyInputDomRef]
  );

  const calcCustomControlKeyInputVal = useMemo(() => {
    return convertKeyboardEvtKeyToDisplayText(customControlKeyInputVal);
  }, [customControlKeyInputVal]);

  return (
    <Wrapper>
      <table>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "50%" }} />
        </colgroup>
        <tbody>
          {[
            { name: "LEFT", value: setting.moveLeft, handler: withCustomControlModalOpen("moveLeft") },
            { name: "RIGHT", value: setting.moveRight, handler: withCustomControlModalOpen("moveRight") },
            {
              name: "ROTATION(CLOCKWISE)",
              value: setting.clockwiseRotation,
              handler: withCustomControlModalOpen("clockwiseRotation"),
            },
            {
              name: "ROTATION(COUNTER CLOCKWISE)",
              value: setting.counterclockwiseRotation,
              handler: withCustomControlModalOpen("counterclockwiseRotation"),
            },
            {
              name: "SOFT DROP",
              value: setting.softDrop,
              handler: withCustomControlModalOpen("softDrop"),
            },
            { name: "HARD DROP", value: setting.hardDrop, handler: withCustomControlModalOpen("hardDrop") },
            { name: "HOLD", value: setting.hold, handler: withCustomControlModalOpen("hold") },
          ].map(({ name, value, handler }, index) => (
            <tr key={index}>
              <td>
                <Font inline={true} level="six">
                  {name}
                </Font>
              </td>
              <td>
                <KeyBoardKey onClick={() => handler()}>
                  <Font inline={true} level="six">
                    {convertKeyboardEvtKeyToDisplayText(value)}
                  </Font>
                </KeyBoardKey>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <BaseModal
        isOpen={isCustomControlKeyModalOpen}
        body={
          <div>
            <Font level="four">Press New Key</Font>
            <div
              style={{
                marginTop: "16px",
              }}
            >
              <label>
                <input
                  ref={(el) => setCustomControlKeyInputDomRef(el)}
                  value={calcCustomControlKeyInputVal}
                  onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                    event.stopPropagation();
                    if (event.key === KEYCODE.VALUE_ESCAPE) {
                      return createAlertModal("'ESCAPE' key is not allowed to use");
                    }
                    setCustomControlKeyInputVal(event.key);
                  }}
                  readOnly
                  className="nes-input"
                  type="text"
                />
              </label>
            </div>
          </div>
        }
        confirm={{
          onClick: () => {
            if (!updateCustomControlKeyRef.current) return;
            if (!customControlKeyInputVal) {
              return createAlertModal("press key first!");
            }
            const updateCustomControlKey = updateCustomControlKeyRef.current as keyof ISetting["control"];
            setIsCustomControlKeyModalOpen(false);
            const newSetting = getKeys(setting).reduce((acc, key) => {
              if (key === updateCustomControlKey) {
                acc[key] = customControlKeyInputVal;
              } else if (setting[key] === customControlKeyInputVal) {
                acc[key] = setting[updateCustomControlKey];
              } else {
                acc[key] = setting[key];
              }
              return acc;
            }, {} as ISetting["control"]);
            updateSetting(newSetting);
            setCustomControlKeyInputVal("");
            setUpdateCustomControlKeyRef(null);
          },
        }}
        cancel={{
          onClick: () => {
            setCustomControlKeyInputVal("");
            setUpdateCustomControlKeyRef(null);
            setIsCustomControlKeyModalOpen(false);
          },
        }}
      />
    </Wrapper>
  );
};

export default ControlTab;
