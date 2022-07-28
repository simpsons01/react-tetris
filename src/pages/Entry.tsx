import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const toDouble = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      http.post("game/online").then(() => {
        navigate("/double");
      });
    },
    [navigate]
  );
  return (
    <EntryContainer>
      <h1>TETRIS GAME</h1>
      <ul className="nes-list is-circle">
        <li>
          <Link to="/single">PLAY 1P</Link>
        </li>
        <li>
          <a onClick={(e) => toDouble(e)}>PLAY 2P</a>
        </li>
      </ul>
    </EntryContainer>
  );
};

export default Entry;
