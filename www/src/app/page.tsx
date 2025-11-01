"use client";

import { Scrollable } from "@monolithium/next/components";

import Infobar from "@/components/layout/Infobar";
import Navbar from "@/components/layout/Navbar";

import styles from "./page.module.scss";
import { useEffect } from "react";
import Engine from "@/utils/processing/engines/dynamic/Engine";
import { useCreateVitaShardsDynamic } from "@/utils/supabase/tables/vitas/shards/dynamic/$write";
import { useReadOwnChronicles } from "@/utils/supabase/tables/chronicles";
import filterChronicles from "@/utils/processing/data/chronicles/filterChronicles";

const Home = () => {
  /** ANCHOR: Fetched Data */
  const { chronicles, isLoading } = useReadOwnChronicles();

  /** ANCHOR: Mutate Data */
  const { mutate } = useCreateVitaShardsDynamic();

  useEffect(() => {
    if (!isLoading) {
      console.log(chronicles);

      const { linear } = filterChronicles(chronicles);

      // const engine = new Engine();
      // engine.init(linear);

      // mutate({ vitaId: "1", shards: engine.toJson() });
    }
  }, [chronicles, mutate]);

  return (
    <Scrollable shouldScrollY classNameScrollbar={styles["scrollbar"]}>
      <div className={styles["page"]}>
        <div className={styles["page__infobar"]}>
          <Infobar></Infobar>
        </div>
        <div className={styles["page__navbar"]}>
          <Navbar></Navbar>
        </div>
        <div className={styles["test"]}></div>
      </div>
    </Scrollable>
  );
};

export default Home;
