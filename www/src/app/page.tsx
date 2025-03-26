"use client";

/** Styling */
import scss from "./page.module.scss";
/** Components */
import Infobar from "@/components/infobar/infobar";
import Navbar from "@/components/navbar/navbar";
import Button from "@/utils/ui/Button/Button";
import HomeGraphic from "@/assets/images/svg/sharp_line/home.svg";
import Popup from "@/utils/ui/oldpopup/popup";
import ScrollContainer from "@/utils/ui/ScrollContainer/ScrollContainer";
import { useEffect, useRef } from "react";

export default function Home() {
    const page = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // console.log("refOriginal", page.current);
    }, []);

    return (
        <ScrollContainer orientation="top" yScroll>
            <div className={scss["page"]} ref={page}>
                <div className={scss["page__infobar"]}>
                    <Infobar></Infobar>
                </div>
                <div className={scss["page__navbar"]}>
                    <Navbar></Navbar>
                </div>
                <div className={scss["test"]}></div>
            </div>
        </ScrollContainer>
    );
}
