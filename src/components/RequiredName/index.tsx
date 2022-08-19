import React from "react";
import { SocketContext, ISocketContext } from "../../hooks/socket";
import { ClientToServerCallback } from "../../common/utils";
import { Navigate } from "react-router-dom";

interface IRequiredName {
  children: JSX.Element;
}

const RequiredName = (props: IRequiredName): JSX.Element | null => {
  const [isInitial, setIsInitial] = React.useState<boolean>(false);
  const [hasName, setHasName] = React.useState<boolean>(false);

  const { socketInstance, isConnected, isConnectErrorOccur } = React.useContext<
    ISocketContext<
      {},
      {
        get_name: (done: ClientToServerCallback<{ name: string }>) => void;
      }
    >
  >(SocketContext);

  React.useEffect(() => {
    if (isConnected) {
      socketInstance.emit("get_name", ({ data: { name } }) => {
        setIsInitial(true);
        setHasName(!!name);
      });
    } else {
      setIsInitial(true);
    }
    return () => {
      if (isConnected) {
      }
    };
  }, [isConnected, socketInstance]);

  if (isConnectErrorOccur) return <Navigate to="/" />;

  if (!isInitial) return null;

  return hasName ? props.children : <Navigate to="/" />;
};

export default RequiredName;
