import React from "react";
import styled from "styled-components";
import Modal from "../components/Modal";
import { ISocketContext, SocketContext } from "../context/socket";
import { IRoom } from "../common/rooms";
import { useNavigate } from "react-router-dom";
import { KEYCODE } from "../common/keyboard";
import {
  ClientToServerCallback,
  createAlertModal,
  AnyFunction,
} from "../common/utils";

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

const Rooms = (): JSX.Element => {
  const navigate = useNavigate();

  const { socketInstance, isConnected } = React.useContext<
    ISocketContext<
      {
        error_occur: AnyFunction;
      },
      {
        get_socket_data: (
          done: ClientToServerCallback<{ roomId: string; name: string }>
        ) => void;
        get_rooms: (
          done: ClientToServerCallback<{ rooms: Array<IRoom> }>
        ) => void;
        join_room: (roomId: string, done: ClientToServerCallback) => void;
        create_room: (
          roomName: string,
          done: ClientToServerCallback<{ roomId: string | null }>
        ) => void;
      }
    >
  >(SocketContext);

  const [isNoRoomsModalOpen, setIsNoRoomsModalOpen] =
    React.useState<boolean>(false);

  const [isCreateRoomModalOpen, setIsCreateRoomsModalOpen] =
    React.useState<boolean>(false);

  const [rooms, setRooms] = React.useState<Array<IRoom>>([]);

  const [roomName, setRoomName] = React.useState<string>("");

  const getRooms = React.useCallback(() => {
    if (isConnected && socketInstance) {
      socketInstance.emit(
        "get_rooms",
        ({ data: { rooms }, metadata: { isError } }) => {
          if (isError) return;
          setRooms(rooms);
          if (rooms.length === 0) {
            setIsNoRoomsModalOpen(true);
          }
        }
      );
    }
  }, [isConnected, socketInstance]);

  const joinRoom = React.useCallback(
    (roomId: string) => {
      if (isConnected && socketInstance) {
        socketInstance.emit(
          "join_room",
          roomId,
          ({ data: {}, metadata: { isSuccess, isError } }) => {
            if (isError) return;
            if (isSuccess) {
              navigate(`/room/${roomId}`);
            } else {
              createAlertModal("JOIN ROOM FAILED");
            }
          }
        );
      }
    },
    [isConnected, socketInstance, navigate]
  );

  const createRoom = React.useCallback(
    (roomName: string) => {
      if (isConnected && socketInstance && roomName) {
        socketInstance.emit(
          "create_room",
          roomName,
          ({ data: { roomId }, metadata: { isSuccess, isError } }) => {
            if (isError) return;
            if (isSuccess) {
              navigate(`/room/${roomId as string}`);
            } else {
              createAlertModal("CREATE ROOM FAILED");
            }
          }
        );
      }
    },
    [isConnected, socketInstance, navigate]
  );

  React.useEffect(() => {
    if (isConnected) {
      socketInstance.emit("get_socket_data", ({ data: { name } }) => {
        if (!name) {
          navigate("/");
        } else {
          getRooms();
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

  return (
    <RoomsContainer>
      <RoomsLeftPanel>
        {rooms.map((room) => (
          <Room
            onClick={() => {
              joinRoom(room.id);
            }}
            key={room.id}
            className="nes-btn"
          >
            <p>ROOM NAME: {room.name}</p>
            <p>HOST NAME: {room.host.name}</p>
          </Room>
        ))}
      </RoomsLeftPanel>
      <RoomsPanelDivider />
      <RoomsRightPanel>
        <button
          onClick={() => setIsCreateRoomsModalOpen(true)}
          className="nes-btn"
        >
          CREATE ROOM
        </button>
        <button onClick={() => getRooms()} className="nes-btn">
          UPDATE ROOM
        </button>
      </RoomsRightPanel>
      <Modal
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
      <Modal
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
                  createRoom(roomName);
                }
              }}
            />
          </div>
        }
        confirm={{
          text: "CREATE",
          onClick: () => {
            createRoom(roomName);
          },
        }}
        cancel={{
          text: "PLAY 1P",
          onClick: () => {
            navigate("/single");
          },
        }}
      />
    </RoomsContainer>
  );
};

export default Rooms;
