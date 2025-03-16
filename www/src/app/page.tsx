/** Styling */
import scss from "./page.module.scss";
/** Components */
import Infobar from "@/components/infobar/infobar";
import Navbar from "@/components/navbar/navbar";
import isMobileBrowser from "@/utils/functions/isMobileBrowser";

export default function Home() {
    console.log(isMobileBrowser());

    return (
        <div className={scss["page"]}>
            <div className={scss["page__infobar"]}>
                <Infobar></Infobar>
            </div>
            <div className={scss["page__navbar"]}>
                <Navbar></Navbar>
            </div>
        </div>
    );
}
