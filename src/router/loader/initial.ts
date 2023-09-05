import { defer } from "react-router-dom";
import * as http from "../../common/http";

const initialLoader = async () => {
  const promise = http.getPlayer().catch(error => {
    if(error.response.status === 401) {
      return {
        data: { player: { name: "", id: "" }  }
      }
    }else {
      return Promise.reject(error)
    }
  });
  return defer({
    player: promise
  });
};

export default initialLoader;
