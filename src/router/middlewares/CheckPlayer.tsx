import { FC, ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { usePlayerContext } from "../../context/player";

const CheckPlayer: FC<{ children: ReactNode }> = (props) => {
  const { isPlayerNil } = usePlayerContext();
  const location = useLocation();

  return isPlayerNil() ? <Navigate to="/" state={{ from: location }} replace /> : <>{props.children}</>;
};

export default CheckPlayer;
