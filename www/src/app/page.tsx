"use client";

import { Scrollable } from "@monolithium/next/components";

import Infobar from "@/components/layout/Infobar";
import Navbar from "@/components/layout/Navbar";

import styles from "./page.module.scss";
import { useOwnChronicles } from "@/shared/supabase/tables/chronicles/";
import { useStoreDynamicShards } from "@/shared/supabase/tables/vitas/shards/dynamic";
import { useEffect } from "react";
import useOwnVitas from "@/shared/supabase/tables/vitas/$read/useOwnVitas";
import { $Schemas } from "@/shared/supabase/schemas";
import useEngine from "@/shared/processing/engines/dynamic/useEngine";

const Home = () => {
  const { data: ownVitas } = useOwnVitas();
  const { data: ownChronicles } = useOwnChronicles();

  const engine = useEngine();

  const writer = useStoreDynamicShards();

  // Nutze mutation.isIdle um nur einmal zu schreiben
  // isIdle = noch nie gestartet, isPending = läuft gerade, isSuccess/isError = fertig
  useEffect(() => {
    if (!(ownChronicles && ownVitas && writer.mutation.isIdle)) return;

    console.log("Own Chronicles:", ownChronicles);

    const linearChronicles =
      $Schemas.Chronicles.Mutations.Linear.To.parse(ownChronicles);

    const engineChronicles =
      $Schemas.Chronicles.Mutations.Engine.To.parse(ownChronicles);

    engine.init(engineChronicles);

    const shards = engine.toShards();

    console.log("linear", linearChronicles);
    console.log("engine", engineChronicles);
    console.log("shards", shards);

    writer.setDefaults({ vitaId: ownVitas[0]?.id }).write(shards);
  }, [ownChronicles, ownVitas]);

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
