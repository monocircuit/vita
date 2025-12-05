"use client";

import { Scrollable } from "@monolithium/next/components";

import Infobar from "@/components/layout/Infobar";
import Navbar from "@/components/layout/Navbar";

import styles from "./page.module.scss";
import useOwnProfile from "@/shared/supabase/tables/profiles/read/useOwnProfile";
import { useOwnChronicles } from "@/shared/supabase/tables/chronicles/";
import { useDynamicShardsByVitaId } from "@/shared/supabase/tables/vitas/shards/dynamic";
import { useEffect } from "react";
import useOwnVitas from "@/shared/supabase/tables/vitas/$read/useOwnVitas";
import { $Schemas, Schemas } from "@/shared/supabase/schemas";

const Home = () => {
  const { data: vitas } = useOwnVitas();
  const { data: ownChronicles } = useOwnChronicles();

  console.log(vitas);

  useEffect(() => {
    if (ownChronicles) {
      console.log("Own Chronicles:", ownChronicles);

      const linear =
        $Schemas.Chronicles.Mutations.Linear.To.parse(ownChronicles);

      const engine =
        $Schemas.Chronicles.Mutations.Engine.To.parse(ownChronicles);

      const awd: Schemas["Chronicles"]["Mutations"]["Linear"][] = linear;

      console.log("linear", linear);
      console.log("engine", engine);
    }
  }, [ownChronicles]);

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
