import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import http from "../common/http";
import createSocketInstance from "../common/socket/index";

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
      const { data: user } = await http.post<{ name: string; socketId: string; roomId: string }>("/game/online");
      const {
        data: { roomId },
      } = await http.post<{ name: string; socketId: string; roomId: string }>("/game/join-game");
      const socket = createSocketInstance(roomId);
      socket.on("connect", () => {
        console.log("connect");
      });
      socket.on("game-countdown", (sec) => {
        console.log(sec);
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
