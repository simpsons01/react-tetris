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
      await http.post<{ name: string; socketId: string; roomId: string }>("/game/online");
      const socket = createSocketInstance();
      socket.on("connect", () => {
        console.log("connected");
        socket.emit("try_join_game", (isJoined: boolean) => {
          if (!isJoined) {
            console.log("not yet!");
          }
        });
      });
      socket.on("join_game", (sec) => {
        socket.emit("ready", (isReady: boolean) => {
          if (isReady) {
            console.log("i am ready");
          }
        });
      });

      // @ts-ignore
      window.temp = () => {
        socket.emit("try_join_game", (isJoined: boolean) => {
          if (!isJoined) {
            console.log("not yet!");
          }
        });
      };
      socket.on("before_start_game", (leftSec: number) => {
        console.log("before game start and leftSec is " + leftSec + "s");
      });
      socket.on("game_interrupted", () => {
        console.log("game_interrupted");
        socket.emit("leave_game");
      });
      socket.on("game_leftSec", (leftSec: number) => {
        console.log("game start and leftSec is " + leftSec + " s");
      });
      socket.on("game_over", (result) => {
        console.log(result);
        socket.emit("leave_game");
      });
      socket.on("connect_error", (err) => {
        socket.disconnect();
        console.log(err);
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
