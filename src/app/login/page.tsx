import React from "react";
import Login from "@/components/SignIn/SignIn";

import scss from "@/app/login/page.module.scss";

function LoginPage() {
  // console.log("test: " + auth.getUser());

  return (
    <div className={scss["page"]}>
      <div className={scss["page__login"]}>
        <Login></Login>
      </div>
    </div>
  );
}

export default LoginPage;
