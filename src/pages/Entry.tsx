import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import http from "../common/http";
import createSocketInstance from "../common/socket";

const EntryContainer = styled.div`
  ul {
    padding: 0;
    margin-left: 20px;

    li {
      text-align: center;
      a {
        font-size: 2rem;
        color: #212529;
      }
    }
  }
`;

const Entry = (): JSX.Element => {
  React.useEffect(() => {
    async function connect() {
      const {
        data: { roomId },
      } = await http.get<{ roomId: string }>("/game/join");
      const socket = createSocketInstance(roomId);
      socket.on("connect", () => {});
      socket.on("game-participant-joined", (arg1, arg2) => {
        console.log(arg1);
        arg2();
      });
      socket.on("game-start", () => {
        console.log("game-start");
      });
      socket.on("game-countdown", (leftSec) => {
        console.log(leftSec);
      });
      socket.on("game-over", () => {
        console.log("game over");
      });
      socket.on("disconnect", () => {
        console.log("disconnect");
      });
    }

    connect();
  }, []);
  return (
    <EntryContainer>
      <h1>TETRIS GAME</h1>
      <ul className="nes-list is-circle">
        <li>
          <Link to="/single">PLAY 1P</Link>
        </li>
        <li>
          <Link to="/double">PLAY 2P</Link>
        </li>
      </ul>
    </EntryContainer>
  );
};

export default Entry;
