import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import http from "../common/http";

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
    http.get("health-check").then((res) => {
      console.log(res);
    });
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
