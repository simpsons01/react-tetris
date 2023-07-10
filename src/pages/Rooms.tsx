import type { IRoom } from "../common/rooms";
import type { FC } from "react";
import styled from "styled-components";
import Modal from "../components/Modal";
import Font from "../components/Font";
import Overlay from "../components/Overlay";
import useRequest from "../hooks/request";
import Loading from "../components/Loading";
import * as http from "../common/http";
import { Fragment, useCallback, useState, useEffect } from "react";
import { ROOM_STATE } from "../common/rooms";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { VALUE_ESCAPE } from "keycode-js";
import { TOTAL_LEVEL } from "../common/matrix";

const RoomsContainer = styled.div`
  width: 100%;
  max-width: 996px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  height: 80vh;
`;

const RoomsRightPanel = styled.div`
  flex: 0 0 calc(20% - 2px);
  padding-left: 16px;

  button {
    width: calc(100% - 8px);
  }

  button + button {
    margin-top: 16px;
  }
`;

const RoomsPanelDivider = styled.div`
  flex: 0 0 4px;
  background-color: #212529;
  align-self: stretch;
`;

const RoomsLeftPanel = styled.div`
  flex: 0 0 calc(80% - 2px);
  padding-right: 16px;
  overflow-y: auto;
  position: relative;

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const RoomsLoading = styled.div`
  display: flex;
  align-items: center;
  padding-top: 32px;
  justify-content: center;
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
  width: calc(100% - 8px);
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

const getHostName = (room: IRoom) => {
  let hostName = "";
  const host = room.players.find((player) => player.id === room.host.id);
  if (host) {
    hostName = host.name;
  }
  return hostName;
};

const Rooms: FC = () => {
  const navigate = useNavigate();

  const [isNoRoomsModalOpen, setIsNoRoomsModalOpen] = useState(false);

  const [isCreateRoomModalOpen, setIsCreateRoomsModalOpen] = useState(false);

  const [isToolOverlayOpen, setIsToolOverlayOpen] = useState(false);

  const [rooms, setRooms] = useState<Array<IRoom>>([]);

  const [roomName, setRoomName] = useState("");

  const [roomConfig, setRoomConfig] = useState({
    level: 1,
    sec: 60,
  });

  const [processingGetRooms, getRooms] = useRequest(http.getRooms);

  const [processingCreateRoom, createRoom] = useRequest(http.createRoom);

  const [processingJoinRoom, joinRoom] = useRequest(http.joinRoom);

  const handleGetRooms = useCallback(async () => {
    if (!processingGetRooms) {
      try {
        const {
          data: {
            data: { list: rooms },
          },
        } = await getRooms();
        setRooms(
          rooms.filter((room) => {
            return room.state === ROOM_STATE.CREATED && room.players.length < room.config.playerLimitNum;
          })
        );
      } catch (error) {}
    }
  }, [getRooms, processingGetRooms]);

  const handleJoinRoom = useCallback(
    async (roomId: string) => {
      if (!processingJoinRoom) {
        try {
          await joinRoom(roomId);
          navigate(`/room/${roomId}`);
        } catch (error) {}
      }
    },
    [joinRoom, processingJoinRoom, navigate]
  );

  const handleCreateRoom = useCallback(async () => {
    if (!processingCreateRoom) {
      try {
        const {
          data: {
            data: { roomId },
          },
        } = await createRoom({
          name: roomName,
          config: {
            initialLevel: roomConfig.level,
            sec: roomConfig.sec,
          },
        });
        navigate(`/room/${roomId}`);
      } catch (error) {}
    }
  }, [createRoom, navigate, processingCreateRoom, roomConfig, roomName]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === VALUE_ESCAPE) {
        setIsToolOverlayOpen((prevIsToolOverlayOpen) => !prevIsToolOverlayOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    handleGetRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <RoomsContainer>
        <RoomsLeftPanel>
          {processingGetRooms ? (
            <RoomsLoading>
              <Font level="three">
                <Loading.Dot>FETCHING ROOMS</Loading.Dot>
              </Font>
            </RoomsLoading>
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <Room
                onClick={() => {
                  handleJoinRoom(room.id);
                }}
                key={room.id}
                className="nes-btn"
              >
                <Font level={"six"}>HOST NAME: {getHostName(room)}</Font>
                <Font level={"six"}>ROOM NAME: {room.name}</Font>
                <Font level={"six"}>GAME LEVEL: {room.config.initialLevel}</Font>
                <Font level={"six"}>GAME &nbsp;SEC: {room.config.sec}</Font>
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
          title="CREATE ROOM"
          body={
            <>
              <div className="nes-field">
                <label>name</label>
                <input
                  className="nes-input"
                  id="room_name"
                  type="text"
                  value={roomName}
                  onInput={(event: React.FormEvent<HTMLInputElement>) => {
                    setRoomName(event.currentTarget.value);
                  }}
                />
              </div>
              <div className="nes-field">
                <label>level</label>
                <div className="nes-select">
                  <select
                    value={roomConfig.level}
                    onChange={(event) => {
                      setRoomConfig({
                        ...roomConfig,
                        level: parseInt(event.target.value, 10),
                      });
                    }}
                  >
                    {(() => {
                      const options = [];
                      let level = 1;
                      while (level <= TOTAL_LEVEL) {
                        options.push(
                          <option key={`level:${level}`} value={level}>
                            {level}
                          </option>
                        );
                        level += 1;
                      }
                      return options;
                    })()}
                  </select>
                </div>
              </div>
              <div className="nes-field">
                <label>sec</label>
                <div className="nes-select">
                  <select
                    value={roomConfig.sec}
                    onChange={(event) => {
                      setRoomConfig({
                        ...roomConfig,
                        sec: parseInt(event.target.value, 10),
                      });
                    }}
                  >
                    {[60, 120, 180, 240].map((sec) => (
                      <option key={`sec:${sec}`} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          }
          confirm={{
            text: "CREATE",
            onClick: () => {
              handleCreateRoom();
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
