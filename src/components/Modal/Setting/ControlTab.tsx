import styled from "styled-components";
import Font from "../../Font";
import { FC } from "react";

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
`;

const ControlTab: FC<{}> = (props) => {
  return (
    <Wrapper>
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
    </Wrapper>
  );
};

export default ControlTab;
