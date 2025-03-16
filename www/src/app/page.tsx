/** Styling */
import scss from "./page.module.scss";
/** Components */
import Infobar from "@/components/infobar/infobar";
import Navbar from "@/components/navbar/navbar";
import Button from "@/utils/components/button/button";
import HomeGraphic from "@/assets/images/svg/sharp_line/home.svg";

export default function Home() {
    return (
        <div className={scss["page"]}>
            <div className={scss["page__infobar"]}>
                <Infobar></Infobar>
            </div>
            <div className={scss["page__navbar"]}>
                <Navbar></Navbar>
            </div>
            <div className={scss["page__buttontest"]}>
                <div className={scss["page__buttontest__1"]}>
                    <Button text="Test">
                        <HomeGraphic />
                    </Button>
                </div>
            </div>
        </div>
    );
}
