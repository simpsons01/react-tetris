import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { useCallback, useContext, useState, FC } from "react";
import { KEYCODE } from "../common/keyboard";
import { ISocketContext, SocketContext } from "../context/socket";
import { createAlertModal } from "../common/alert";
import { ClientToServerCallback } from "../common/socket";
import Font from "../components/Font";
import { useSettingModalVisibilityContext } from "../context/settingModalVisibility";

const EntryContainer = styled.div``;

const ListWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;

  ul {
    padding: 0;
    list-style: none;

    li {
      a {
        text-decoration: none;
      }

      button {
        border: none;
        background-color: transparent;
      }
    }

    li + li {
      margin-top: 4px;
    }
  }
`;

const Entry: FC = () => {
  const navigate = useNavigate();

  const { socketInstance, isConnected } = useContext<
    ISocketContext<
      {},
      {
        set_name: (name: string, done: ClientToServerCallback<{}>) => void;
        get_socket_data: (done: ClientToServerCallback<{ roomId: string; name: string }>) => void;
      }
    >
  >(SocketContext);

  const [isCreateUsernameModalOpen, setIsCreateNameModalOpen] = useState<boolean>(false);

  const [userName, setUserName] = useState<string>("");

  const { open: openSettingModal } = useSettingModalVisibilityContext();

  const saveName = useCallback(
    (name: string) => {
      const onFail = () => {
        setIsCreateNameModalOpen(false);
        createAlertModal("FAILED");
      };
      if (isConnected) {
        socketInstance.emit("set_name", name, ({ metadata: { isSuccess, isError } }) => {
          if (isError) {
            onFail();
            return;
          }
          if (isSuccess) {
            navigate("/rooms");
          } else {
            onFail();
          }
        });
      }
    },
    [isConnected, navigate, socketInstance]
  );

  const toRooms = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isConnected) {
        socketInstance.emit("get_socket_data", ({ data: { name } }) => {
          if (name) {
            navigate("/rooms");
          } else {
            setIsCreateNameModalOpen(true);
          }
        });
      }
    },
    [isConnected, navigate, socketInstance]
  );

  return (
    <EntryContainer>
      <Font level={"one"}>TETRIS GAME</Font>
      <ListWrapper>
        <ul className="nes-list is-circle">
          <li>
            <Link to="/single">
              <Font inline={true} level={"two"}>
                PLAY 1P
              </Font>
            </Link>
          </li>
          <li>
            <button onClick={toRooms}>
              <Font inline={true} level={"two"}>
                PLAY 2P
              </Font>
            </button>
          </li>
          <li>
            <button onClick={openSettingModal}>
              <Font inline={true} level={"two"}>
                SETTINGS
              </Font>
            </button>
          </li>
        </ul>
      </ListWrapper>
      <Modal.Base
        isOpen={isCreateUsernameModalOpen}
        title="ENTER YOUR NAME"
        body={
          <div className="nes-field">
            <input
              value={userName}
              className="nes-input"
              type="text"
              onInput={(event: React.FormEvent<HTMLInputElement>) => {
                setUserName(event.currentTarget.value);
              }}
              onKeyDown={(event: React.KeyboardEvent) => {
                if (event.key === KEYCODE.ENTER) {
                  saveName(userName);
                }
              }}
            />
          </div>
        }
        confirm={{
          text: "CREATE",
          onClick: () => {
            saveName(userName);
          },
        }}
        cancel={{
          text: "CANCEL",
          onClick: () => {
            setIsCreateNameModalOpen(false);
          },
        }}
      />
    </EntryContainer>
  );
};

export default Entry;
