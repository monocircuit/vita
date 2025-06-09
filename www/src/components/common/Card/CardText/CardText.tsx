import React from "react";

interface CardTextProps {
  children: string;
}

const CardText = (props: CardTextProps) => {
  return <div id="card-text">{props.children}</div>;
};

export default CardText;
