import type { FC } from "react";
import styled from "styled-components";
import Font from "../components/Font";

const ErrorContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Error: FC = () => {
  return (
    <ErrorContainer>
      <Font align="center" color="#292929" level={"one"}>
        OOPS! THE PAGE IS NOT WORKED
      </Font>
    </ErrorContainer>
  );
};

export default Error;
