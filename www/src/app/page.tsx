"use client";

/** Styling */
import styles from "./page.module.scss";
/** Components */
import Infobar from "@/components/infobar/infobar";
import Navbar from "@/components/navbar/navbar";
import Scrollable from "@/utils/ui/Scrollable/Scrollable";

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
