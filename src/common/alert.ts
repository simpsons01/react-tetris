import React from "react";
import ReactDOM from "react-dom/client";
import Modal from "../components/Modal";
import { AnyFunction } from "./utils";

let modalId = 0;
export const createAlertModal = (
  title: string,
  confirm?: {
    text: string;
    onClick: (e: React.MouseEvent) => void;
  }
): AnyFunction => {
  modalId += 1;
  let modalApp: ReactDOM.Root | null = null;
  let modalContainer: HTMLElement | null = document.createElement("div");
  (modalContainer as HTMLElement).id = `modal-${modalId}`;

  const clear = () => {
    document.body.removeChild(modalContainer as HTMLElement);
    (modalApp as ReactDOM.Root).unmount();
    modalApp = null;
    modalContainer = null;
  };

  document.body.appendChild(modalContainer);
  modalApp = ReactDOM.createRoot(modalContainer);
  modalApp.render(
    React.createElement(Modal.Base, {
      portal: false,
      isOpen: true,
      title,
      confirm: {
        text: confirm ? confirm.text : "confirm",
        onClick: (e) => {
          clear();
          if (confirm) confirm.onClick(e);
        },
      },
    })
  );
  return clear;
};
