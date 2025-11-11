"use client";

import { Scrollable } from "@monolithium/next/components";

import Infobar from "@/components/layout/Infobar";
import Navbar from "@/components/layout/Navbar";

import styles from "./page.module.scss";
import useOwnProfile from "@/shared/supabase/tables/profiles/read/useOwnProfile";
import { useOwnChronicles } from "@/shared/supabase/tables/chronicles/";
import useOwnVitas from "@/shared/supabase/tables/vitas/$read/useOwnVitas";
import { useDynamicShardsByVitaId } from "@/shared/supabase/tables/vitas/shards/dynamic";

const Home = () => {
  const { data: vitas } = useOwnVitas();
  const { data: shards } = useDynamicShardsByVitaId("1");
  const { data: profile } = useOwnProfile();
  const { data: chronicles } = useOwnChronicles();

  console.log(vitas, shards);

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
