import { json } from "react-router-dom";
import axios from "axios";
import * as http from "../../common/http";

const initialLoader = async () => {
  const initialData = {
    player: { name: "", id: "" },
  };
  try {
    const {
      data: { player },
    } = await http.getPlayer();
    initialData.player = player;
    return json(initialData);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return json(initialData);
    }
    throw json({ message: "something went wrong" });
  }
};

export default initialLoader;
