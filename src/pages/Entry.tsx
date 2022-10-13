import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import React from "react";
import { KEYCODE } from "../common/keyboard";
import { ISocketContext, SocketContext } from "../context/socket";
import { createAlertModal } from "../common/alert";
import { ClientToServerCallback } from "../common/socket";
import Font from "../components/Font";

const EntryContainer = styled.div`
  ul {
    padding: 0;
    margin-left: 20px;

    li {
      text-align: center;

      a {
        text-decoration: none;
      }
    }
  }
`;
const Entry = (): JSX.Element => {
  const navigate = useNavigate();

  const { socketInstance, isConnected } = React.useContext<
    ISocketContext<
      {},
      {
        set_name: (name: string, done: ClientToServerCallback<{}>) => void;
        get_socket_data: (done: ClientToServerCallback<{ roomId: string; name: string }>) => void;
      }
    >
  >(SocketContext);

  const [isCreateUsernameModalOpen, setIsCreateNameModalOpen] = React.useState<boolean>(false);

  const [userName, setUserName] = React.useState<string>("");

  const saveName = React.useCallback(
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

  const toRooms = React.useCallback(
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
      <ul className="nes-list is-circle">
        <li>
          <Link to="/single">
            <Font inline={true} level={"two"}>
              PLAY 1P
            </Font>
          </Link>
        </li>
        <li>
          <a href={void 0} onClick={toRooms}>
            <Font inline={true} level={"two"}>
              PLAY 2P
            </Font>
          </a>
        </li>
      </ul>
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
