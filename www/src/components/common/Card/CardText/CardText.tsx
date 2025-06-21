import { SourceSans3 } from "@monolithium/next/fonts";
import React from "react";

interface CardTextProps {
  children: string;
}

const CardText = (props: CardTextProps) => {
  return <div id={`card-text ${SourceSans3.className}`}>{props.children}</div>;
};

export default CardText;
