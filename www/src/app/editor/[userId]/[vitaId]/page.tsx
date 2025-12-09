"use client";

import React, { use, useEffect } from "react";

interface Props {}

const Page = (props: Props) => {
  const params = use(props.params);

  console.log(params);

  return <div>{/* <DynamicView vitaId={params.vitaId} /> */}</div>;
};

export default Page;
