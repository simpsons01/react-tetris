import { useCallback, useContext, useState, useEffect, FC, Fragment } from "react";
import styled from "styled-components";
import Modal from "../components/Modal";
import { ISocketContext, SocketContext } from "../context/socket";
import { IRoom } from "../common/rooms";
import { useNavigate } from "react-router-dom";
import { KEYCODE } from "../common/keyboard";
import { createAlertModal } from "../common/alert";
import { ClientToServerCallback } from "../common/socket";
import Font from "../components/Font";
import Overlay from "../components/Overlay";
import { Link } from "react-router-dom";
import { Key } from "ts-key-enum";

const RoomsContainer = styled.div`
  width: 100%;
  max-width: 996px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  min-height: 80vh;
`;

const RoomsRightPanel = styled.div`
  flex: 0 0 calc(20% - 18px);

  button {
    width: 100%;
  }

  button + button {
    margin-top: 16px;
  }
`;

const RoomsPanelDivider = styled.div`
  flex: 0 0 4px;
  margin: 0 16px;
  background-color: #212529;
  align-self: stretch;
`;

const RoomsLeftPanel = styled.div`
  flex: 0 0 calc(80% - 23px);
  padding-right: 5px;
  position: relative;
`;

const RoomsEmpty = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding-top: 32px;

  button {
    width: 200px;
  }
`;

const Room = styled.button`
  display: block;
  padding: 8px;
  width: 100%;
  & + & {
    margin-top: 16px;
  }
  p {
    text-align: left;
    margin: 0;
  }
  p + p {
    margin-top: 16px;
  }
`;

const ToolList = styled.ul`
  li {
    &:before {
      color: #fff !important;
    }

    a {
      text-decoration: none;
    }
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  right: 16px;
  top: 16px;
  border: none;
  background-color: transparent;
  width: 40px;
  height: 40px;

  &:after {
    position: absolute;
    content: "";
    display: block;
    background-color: #fff;
    width: 40px;
    height: 4px;

    transform: rotate(45deg);
    left: 0;
    top: 15px;
  }

  &:before {
    position: absolute;
    content: "";
    display: block;
    background-color: #fff;
    width: 40px;
    height: 4px;
    left: 0;
    top: 15px;
    transform: rotate(135deg);
  }
`;

const Settings = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;

  button {
    border: none;
    background-color: transparent;
  }

  img {
    display: block;
    max-width: 100%;
  }
`;

enum ROOM_STATE {
  CREATED,
  WAITING_ROOM_FULL,
  GAME_BEFORE_START,
  GAME_START,
  GAME_INTERRUPT,
  GAME_END,
}

const Rooms: FC<{}> = () => {
  const navigate = useNavigate();

  const { socketInstance, isConnected, isConnectErrorOccur } = useContext<
    ISocketContext<
      {
        error_occur: () => void;
      },
      {
        get_socket_data: (done: ClientToServerCallback<{ roomId: string; name: string }>) => void;
        get_rooms: (done: ClientToServerCallback<{ rooms: Array<IRoom> }>) => void;
        join_room: (roomId: string, done: ClientToServerCallback) => void;
        create_room: (roomName: string, done: ClientToServerCallback<{ roomId: string | null }>) => void;
      }
    >
  >(SocketContext);

  const [isNoRoomsModalOpen, setIsNoRoomsModalOpen] = useState(false);

  const [isCreateRoomModalOpen, setIsCreateRoomsModalOpen] = useState(false);

  const [rooms, setRooms] = useState<Array<IRoom>>([]);

  const [roomName, setRoomName] = useState("");

  const [isCheckComplete, setIsCheckComplete] = useState(false);

  const [isToolOverlayOpen, setIsToolOverlayOpen] = useState(false);

  const handleGetRooms = useCallback(() => {
    if (isConnected) {
      socketInstance.emit("get_rooms", ({ data: { rooms }, metadata: { isError } }) => {
        if (isError) return;
        const waitingOtherJoinRooms = rooms.filter((room) => room.state === ROOM_STATE.WAITING_ROOM_FULL);
        setRooms(waitingOtherJoinRooms);
        if (waitingOtherJoinRooms.length === 0) {
          setIsNoRoomsModalOpen(true);
        }
      });
    }
  }, [isConnected, socketInstance]);

  const handleJoinRoom = useCallback(
    (roomId: string) => {
      if (isConnected) {
        socketInstance.emit(
          "join_room",
          roomId,
          ({ data: {}, metadata: { isSuccess, isError, message } }) => {
            if (isError) return;
            if (isSuccess) {
              navigate(`/room/${roomId}`);
            } else {
              createAlertModal(message ? message : "JOIN ROOM FAILED");
            }
          }
        );
      }
    },
    [isConnected, socketInstance, navigate]
  );

  const handleCreateRoom = useCallback(
    (roomName: string) => {
      if (isConnected) {
        socketInstance.emit(
          "create_room",
          roomName,
          ({ data: { roomId }, metadata: { isSuccess, isError, message } }) => {
            if (isError) return;
            if (isSuccess) {
              navigate(`/room/${roomId as string}`);
            } else {
              createAlertModal(message ? message : "CREATE ROOM FAILED");
            }
          }
        );
      }
    },
    [isConnected, socketInstance, navigate]
  );

  const handleOnError = useCallback(() => {
    createAlertModal("ERROR OCCUR", {
      text: "confirm",
      onClick: () => {
        navigate("/");
      },
    });
  }, [navigate]);

  useEffect(() => {
    if (isConnected) {
      socketInstance.emit("get_socket_data", ({ data: { name } }) => {
        setIsCheckComplete(true);
        if (!name) {
          navigate("/");
        } else {
          handleGetRooms();
        }
      });
    } else {
      navigate("/");
    }
    return () => {
      if (isConnected) {
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isConnected) {
      socketInstance.on("error_occur", () => {
        handleOnError();
      });
    } else {
      if (isCheckComplete) {
        handleOnError();
      }
    }
    return () => {
      if (isConnected) {
        socketInstance.off("error_occur");
      }
    };
  }, [socketInstance, isConnected, isConnectErrorOccur, isCheckComplete, handleOnError]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === Key.Escape) {
        setIsToolOverlayOpen((prevIsToolOverlayOpen) => !prevIsToolOverlayOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <Fragment>
      <RoomsContainer>
        <RoomsLeftPanel>
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <Room
                onClick={() => {
                  handleJoinRoom(room.id);
                }}
                key={room.id}
                className="nes-btn"
              >
                <Font level={"six"}>ROOM NAME: {room.name}</Font>
                <Font level={"six"}>HOST NAME: {room.host.name}</Font>
              </Room>
            ))
          ) : (
            <RoomsEmpty>
              <Font level={"three"}>NO ROOM AVAILABLE</Font>
              <button onClick={() => navigate("/single")} className="nes-btn">
                PLAY 1P
              </button>
            </RoomsEmpty>
          )}
        </RoomsLeftPanel>
        <RoomsPanelDivider />
        <RoomsRightPanel>
          <button onClick={() => setIsCreateRoomsModalOpen(true)} className="nes-btn">
            CREATE ROOM
          </button>
          <button onClick={() => handleGetRooms()} className="nes-btn">
            UPDATE ROOM
          </button>
        </RoomsRightPanel>
        <Modal.Base
          isOpen={isNoRoomsModalOpen}
          title="OPS!"
          body="THERE IS NO ROOM AVAILABLE"
          cancel={{
            text: "CANCEL",
            onClick: () => {
              setIsNoRoomsModalOpen(false);
            },
          }}
          confirm={{
            text: "CREATE ROOM",
            onClick: () => {
              setIsNoRoomsModalOpen(false);
              setIsCreateRoomsModalOpen(true);
            },
          }}
        />
        <Modal.Base
          isOpen={isCreateRoomModalOpen}
          title="ENTER ROOM NAME"
          body={
            <div className="nes-field">
              <input
                className="nes-input"
                id="room_name"
                type="text"
                value={roomName}
                onInput={(event: React.FormEvent<HTMLInputElement>) => {
                  setRoomName(event.currentTarget.value);
                }}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === KEYCODE.ENTER) {
                    handleCreateRoom(roomName);
                  }
                }}
              />
            </div>
          }
          confirm={{
            text: "CREATE",
            onClick: () => {
              handleCreateRoom(roomName);
            },
          }}
          cancel={{
            text: "CANCEL",
            onClick: () => {
              setIsCreateRoomsModalOpen(false);
            },
          }}
        />
      </RoomsContainer>
      <Settings>
        <button onClick={() => setIsToolOverlayOpen(true)}>
          <img src={`${process.env.REACT_APP_STATIC_URL}/settings.png`} alt="setting" />
        </button>
      </Settings>
      {isToolOverlayOpen ? (
        <Overlay background="rgba(0, 0, 0, 0.8)">
          <ToolList className="nes-list is-circle">
            <li>
              <Link to="/">
                <Font color="#fff" inline={true} level={"two"}>
                  HOME
                </Font>
              </Link>
            </li>
            <li>
              <Link to="/single">
                <Font color="#fff" inline={true} level={"two"}>
                  PLAY 1P
                </Font>
              </Link>
            </li>
          </ToolList>
          <CloseBtn onClick={() => setIsToolOverlayOpen(false)} />
        </Overlay>
      ) : null}
    </Fragment>
  );
};

export default Rooms;
