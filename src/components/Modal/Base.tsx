import { FC } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import Font from "../Font";
import Overlay from "../Overlay";

const Container = styled.div`
  position: absolute;
  min-width: 400px;
  padding: 32px;
  background-color: #fff;
  z-index: 1;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
`;

const Header = styled.div``;

const Body = styled.div`
  margin-top: 24px;
`;

const Footer = styled.div`
  margin-top: 24px;
  text-align: center;

  .cancel {
    margin-right: 24px;
  }
`;

export interface IBaseModal {
  isOpen: boolean;
  title?: string;
  body?: React.ReactNode;
  confirm?: {
    text: string;
    onClick: (e: React.MouseEvent) => void;
  };
  cancel?: {
    text: string;
    onClick: (e: React.MouseEvent) => void;
  };
  mountEl?: HTMLElement;
  portal?: boolean;
}

const BaseModal: FC<IBaseModal> = (props) => {
  const { isOpen, title, body, confirm, cancel, mountEl = document.body, portal = true } = props;
  if (!isOpen) return null;

  const modalElement = (
    <Overlay>
      <Container className="nes-dialog is-rounded">
        {title ? (
          <Header>
            <Font level={"four"}>{title}</Font>
          </Header>
        ) : null}
        {body ? (
          <Body>
            <Font level={"five"}>{body}</Font>
          </Body>
        ) : null}
        {confirm || cancel ? (
          <Footer>
            {cancel ? (
              <button className="cancel nes-btn" onClick={cancel.onClick}>
                {cancel.text}
              </button>
            ) : null}
            {confirm ? (
              <button className="confirm nes-btn" onClick={confirm.onClick}>
                {confirm.text}
              </button>
            ) : null}
          </Footer>
        ) : null}
      </Container>
    </Overlay>
  );

  return portal ? createPortal(modalElement, mountEl) : modalElement;
};

export default BaseModal;
