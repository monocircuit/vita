/** React */
import { FunctionComponent } from "react";
/** Styles */
import scss from "./Infobar.module.scss";

interface Props {
    children?: React.ReactNode[];
}

const Infobar: FunctionComponent<Props> = ({ children }) => {
    return <div className={scss["infobar"]}>{children}</div>;
};

export default Infobar;
