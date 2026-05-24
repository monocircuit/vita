import React from "react";
import ForgotPassword from "@/components/ForgotPassword/ForgotPassword";

import scss from "@/app/login/page.module.scss";

function ForgotPasswordPage() {
  return (
    <div className={scss["page"]}>
      <div className={scss["page__login"]}>
        <ForgotPassword />
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
