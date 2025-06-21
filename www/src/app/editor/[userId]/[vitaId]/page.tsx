"use client";

import React, { use, useEffect } from "react";

interface Props {}

const Page = (props: Props) => {
  const params = use(props.params);

  return <div>Page</div>;
};

export default Page;
