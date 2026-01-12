"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import CustomDashboardLayoutUsers from "@/components/common/custom_dashboard_layout_users/CustomDashboardLayoutUsers";
import UserHeaderLayout from "../header_layout_dashboard/UserHeaderLayout";

import CustomMessage from "@/components/common/custom_messages/CustomMessage";
import { titleStyleCss } from "@/theme/text_styles";

const UserHomePageContent: React.FC<{}> = () => {
  const dispatch = useAppDispatch();

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleButtonClick = () => {
    setShowErrorMessage(false);
    setSuccessMessage("");
    setShowErrorMessage(false);
    setErrorMessage("");
  };

  return (
    <>
      {showErrorMessage && (
        <CustomMessage
          typeMessage="error"
          message={errorMessage?.toString() || "¡Error en la petición!"}
        />
      )}

      {showSuccessMessage && (
        <CustomMessage
          typeMessage="success"
          message={
            successMessage?.toString() || `Acción realizada correctamente!`
          }
        />
      )}

      <CustomDashboardLayoutUsers
        customLayoutHeader={<UserHeaderLayout />}
        customLayoutContent={
          <div
            style={{
              width: "100%",
              display: "flex",
              flexFlow: "column wrap",
              padding: "0px 0px",
              margin: "0px 0px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingBlock: "7px",
              }}
            >
              <img
                src="/logos/fenix-ver-naranja-sin-fondo-ok.png"
                alt="Logo de Fenix"
                style={{ height: "77px" }}
              />
            </div>

            <h2
              className="homepage-title"
              style={{
                ...titleStyleCss,
                textAlign: "center",
                marginBlock: "13px",
              }}
            >
              Pagina de Inicio
            </h2>
          </div>
        }
      />
    </>
  );
};

export default UserHomePageContent;
