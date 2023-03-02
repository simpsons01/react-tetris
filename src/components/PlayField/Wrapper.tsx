import styled from "styled-components";

const Wrapper = styled.div.attrs(() => ({
  className: "nes-container is-rounded",
}))`
  background-color: #eeeeee;
  position: relative;
  width: calc(35vh + 8px);
  height: calc(70vh + 8px);

  &&& {
    padding: 0;
    margin: 0;
  }
`;

export default Wrapper;
