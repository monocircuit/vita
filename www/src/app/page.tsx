"use client";

import { Scrollable } from "@monolithium/next/components";

import Infobar from "@components/Infobar";
import Navbar from "@components/Navbar";

import styles from "./page.module.scss";

const Home = () => {
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
