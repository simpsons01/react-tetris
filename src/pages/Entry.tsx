import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { useCallback, useState, FC } from "react";
import { KEYCODE } from "../common/keyboard";
import Font from "../components/Font";
import { useSettingModalVisibilityContext } from "../context/settingModalVisibility";
import * as http from "../common/http";
import { saveToken } from "../common/token";
import { usePlayerContext } from "../context/player";
import useRequest from "../hooks/request";

const EntryContainer = styled.div``;

const ListWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;

  ul {
    padding: 0;
    list-style: none;

    li {
      a {
        text-decoration: none;
      }

      button {
        border: none;
        background-color: transparent;
      }
    }

    li + li {
      margin-top: 4px;
    }
  }
`;

const Entry: FC = () => {
  const navigate = useNavigate();

  const { setPlayerRef, isPlayerNil } = usePlayerContext();

  const [isCreatePlayerNameModalOpen, setIsCreatePlayerNameModalOpen] = useState(false);

  const [playerName, setPlayerName] = useState("");

  const { open: openSettingModal } = useSettingModalVisibilityContext();

  const [handleCreatePlayerProcessing, handleCreatePlayer] = useRequest(http.createPlayer);

  const saveName = useCallback(async () => {
    if (!handleCreatePlayerProcessing) {
      try {
        const {
          data: {
            data: { playerId, token },
          },
        } = await handleCreatePlayer({ name: playerName });
        saveToken(token);
        setPlayerRef({ name: playerName, id: playerId });
        navigate("/rooms");
      } catch (error) {
        console.log(error);
      }
    }
  }, [handleCreatePlayerProcessing, setPlayerRef, playerName, handleCreatePlayer, navigate]);

  const toRooms = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!isPlayerNil()) {
        navigate("/rooms");
      } else {
        setIsCreatePlayerNameModalOpen(true);
      }
    },
    [isPlayerNil, navigate]
  );

  return (
    <EntryContainer>
      <Font level={"one"}>TETRIS GAME</Font>
      <ListWrapper>
        <ul className="nes-list is-circle">
          <li>
            <Link to="/single">
              <Font inline={true} level={"two"}>
                PLAY 1P
              </Font>
            </Link>
          </li>
          <li>
            <button onClick={toRooms}>
              <Font inline={true} level={"two"}>
                PLAY 2P
              </Font>
            </button>
          </li>
          <li>
            <button onClick={openSettingModal}>
              <Font inline={true} level={"two"}>
                SETTINGS
              </Font>
            </button>
          </li>
        </ul>
      </ListWrapper>
      <Modal.Base
        isOpen={isCreatePlayerNameModalOpen}
        title="ENTER YOUR NAME"
        body={
          <div className="nes-field">
            <input
              value={playerName}
              className="nes-input"
              type="text"
              onInput={(event: React.FormEvent<HTMLInputElement>) => {
                setPlayerName(event.currentTarget.value);
              }}
              onKeyDown={(event: React.KeyboardEvent) => {
                if (event.key === KEYCODE.ENTER) {
                  saveName();
                }
              }}
            />
          </div>
        }
        confirm={{
          text: "CREATE",
          onClick: () => {
            saveName();
          },
        }}
        cancel={{
          text: "CANCEL",
          onClick: () => {
            setIsCreatePlayerNameModalOpen(false);
          },
        }}
      />
    </EntryContainer>
  );
};

export default Entry;
