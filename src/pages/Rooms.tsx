import React from "react";
import styled from "styled-components";
import { SocketContext } from "../hooks/socket";

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
  const { socketInstance, isConnected, isErrorOccur } =
    React.useContext(SocketContext);

  return (
    <RoomsContainer>
      <RoomsLeftPanel>
        <Room className="nes-btn">
          <p>ROOM NAME: HELLO WORLD</p>
          <p>HOST NAME: RAY.ZHU</p>
        </Room>
      </RoomsLeftPanel>
      <RoomsPanelDivider />
      <RoomsRightPanel>
        <button className="nes-btn">CREATE ROOM</button>
        <button className="nes-btn">UPDATE</button>
      </RoomsRightPanel>
    </RoomsContainer>
  );
};

export default Rooms;
