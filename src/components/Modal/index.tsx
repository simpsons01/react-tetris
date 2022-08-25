import React from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1000;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.6);
`;

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

const Header = styled.div`
  font-size: 24px;
  line-height: 24px;
`;

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

export interface IModal {
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

const Modal = (props: IModal): JSX.Element | null => {
  const { isOpen, title, body, confirm, cancel, mountEl = document.body, portal = true } = props;

  if (!isOpen) return null;

  const modalElement = (
    <Overlay>
      <Container className="nes-dialog is-rounded">
        {title ? <Header>{title}</Header> : null}
        {body ? <Body>{body}</Body> : null}
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

export default Modal;
