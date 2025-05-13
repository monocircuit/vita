import { useRef } from "react";
import Pocketbase from "pocketbase";

const usePocketbase = () => {
  const pocketbase = useRef<Pocketbase>(
    new Pocketbase(process.env.NEXT_PUBLIC_POCKETBASE_URL),
  );

  return pocketbase;
};

export default usePocketbase;
