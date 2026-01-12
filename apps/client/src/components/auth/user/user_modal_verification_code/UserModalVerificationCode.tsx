"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Modal, Input, Button, Form, Divider } from "antd";
import Link from "next/link";

import { TbPasswordUser } from "react-icons/tb";

import CustomLoadingOverlay from "@/components/common/custom_loading_overlay/CustomLoadingOverlay";
import CustomMessage from "@/components/common/custom_messages/CustomMessage";
import CustomSpin from "@/components/common/custom_spin/CustomSpin";
import CountdownTimer from "@/components/common/countdown_timer/CountdownTimer";

import { useResendVerificationUserCodeMutation } from "@/redux/apis/login_user/loginUserApi";

import { setStateUser } from "@/redux/features/user/userSlice";

import {
  setIsPageLoading,
  setUserModalIsOpen,
} from "@/redux/features/common/modal/modalSlice";

import { maskEmail } from "@/helpers/mask_data/mask_email";

const UserModalVerificationCode: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const userModalState = useAppSelector((state) => state.modal.userModalIsOpen);

  const isPageLoadingState = useAppSelector(
    (state) => state.modal.isPageLoading
  );

  const emailUserLoginState = useAppSelector((state) => state.user.email);
  const verificationCodeAdminLoginState = useAppSelector(
    (state) => state.user.verification_code
  );

  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [isSubmittingResendCode, setIsSubmittingResendCode] = useState(false);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [resendCodeDisable, setResendCodeDisable] = useState(true);

  const [
    resendUserVerificationCode,
    {
      data: resendCodeData,
      isLoading: isResendCodeLoading,
      isSuccess: isResendCodeSuccess,
      isError: isResendCodeError,
    },
  ] = useResendVerificationUserCodeMutation({
    fixedCacheKey: "resendUserCodeData",
  });

  useEffect(() => {
    if (!emailUserLoginState) {
      setShowErrorMessage(true);
      setErrorMessage("¡Error al obtener el correo del usuario!");
    }
  }, [emailUserLoginState]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsSubmittingConfirm(true);

      const verificationCode = verificationCodeAdminLoginState
        ? parseInt(verificationCodeAdminLoginState?.toString(), 10)
        : "";

      const responseNextAuth = await signIn(
        process.env.NEXT_PUBLIC_NAME_AUTH_CREDENTIALS_USERS,
        {
          verification_code: verificationCode,
          email: emailUserLoginState,
          redirect: false,
        }
      );

      if (responseNextAuth?.error) {
        dispatch(
          setStateUser({
            field: "errors",
            value: responseNextAuth.error.split(","),
          })
        );
        setShowErrorMessage(true);
      }

      if (responseNextAuth?.status === 200) {
        dispatch(setIsPageLoading(true));

        setShowSuccessMessage(true);
        setSuccessMessage("Ingresando, por favor espere...");

        dispatch(setStateUser({ field: "password", value: "" }));
        dispatch(setStateUser({ field: "verification_code", value: 0 }));

        await router.replace("/user/homepage", {
          scroll: false,
        });

        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  const handleResentCode = async (e: React.MouseEvent<HTMLFormElement>) => {
    if (!emailUserLoginState) {
      setErrorMessage("¡Error al obtener el correo del usuario!");
      setShowErrorMessage(true);

      return;
    }

    try {
      setIsSubmittingResendCode(true);

      const response: any = await resendUserVerificationCode({
        email: emailUserLoginState,
      });

      let isResponseError = response.error;

      if (!isResendCodeSuccess && !isResendCodeLoading && isResendCodeError) {
        dispatch(
          setStateUser({
            field: "errors",
            value: isResponseError?.data.message,
          })
        );
        setShowErrorMessage(true);
      }
      if (!isResendCodeError && !isResponseError) {
        setShowSuccessMessage(true);
        setSuccessMessage("¡Código Reenviado Correctamente!");
        setResendCodeDisable(true);
      }
    } catch (error) {
      console.error(error);

      dispatch(
        setStateUser({ field: "errors", value: "Internal server error" })
      );
      setShowErrorMessage(true);
    } finally {
      setIsSubmittingResendCode(false);
    }
  };

  const handleCancel = () => {
    dispatch(setUserModalIsOpen(false));

    <Link href="/login" scroll={false} />;
    window.location.reload();
  };

  const handleButtonClick = () => {
    dispatch(setStateUser({ field: "errors", value: [] }));
    setShowErrorMessage(false);
    setShowSuccessMessage(false);
  };

  return (
    <div>
      {showErrorMessage && (
        <CustomMessage
          typeMessage="error"
          message={errorMessage || "¡Código incorrecto!"}
        />
      )}
      {showSuccessMessage && (
        <CustomMessage
          typeMessage="success"
          message={successMessage || "¡Código Reenviado Correctamente!"}
        />
      )}

      <Modal
        className="modal-verification-code"
        open={userModalState}
        confirmLoading={isSubmittingConfirm}
        onCancel={handleCancel}
        destroyOnHidden={true}
        width={371}
        footer={null}
        maskClosable={false}
        centered
      >
        <div
          className="content-modal"
          style={{
            textAlign: "center",
            flexDirection: "column",
            alignItems: "center",
            marginBlock: 10,
            marginInline: 7,
          }}
        >
          <h2
            className="title-modal"
            style={{
              fontWeight: "500",
              lineHeight: 1.3,
              marginBottom: 7,
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 27,
              textAlign: "center",
            }}
          >
            Ingresar código de verificación
          </h2>

          <h4
            className="subtitle-modal"
            style={{
              fontWeight: "400",
              lineHeight: 1.3,
              marginTop: 0,
              marginBottom: 7,
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBlock: 7,
            }}
          >
            Hemos enviado un código de ingreso al siguiente correo electrónico:
          </h4>

          <h5
            className="user-email"
            style={{
              fontWeight: "bold",
              fontSize: 13,
              color: "#015E90",
              lineHeight: 1.7,
              letterSpacing: 1.3,
              marginBlock: 7,
            }}
          >
            {maskEmail(emailUserLoginState || "")}
          </h5>

          <CustomLoadingOverlay isLoading={isPageLoadingState} />

          <Form
            id="form-verify-code-modal"
            name="form-verify-code-modal"
            initialValues={{ remember: false }}
            autoComplete="false"
            onFinish={handleSubmit}
          >
            <Form.Item
              id="user-code"
              className="user-code"
              name={"user-code"}
              style={{ textAlign: "center" }}
              normalize={(value) => {
                if (!value) return "";

                return value.replace(/[^0-9]/g, "");
              }}
              rules={[
                {
                  required: true,
                  message: "¡Por favor ingresa código de verificación!",
                },
                {
                  pattern: /^[0-9]+$/,
                  message: "¡Por favor ingresa solo números!",
                },
                {
                  min: 4,
                  message: "¡Por favor ingresa mínimo 4 números!",
                },
                {
                  max: 5,
                  message: "¡Por favor ingresa máximo 5 números!",
                },
              ]}
            >
              <Input
                id="user-input-code"
                className="user-input-code"
                type="tel"
                prefix={
                  <TbPasswordUser
                    className="input-code-item-icon"
                    style={{ paddingInline: "1px", color: "#3F97AF" }}
                  />
                }
                style={{
                  width: 170,
                  fontSize: 14,
                  fontWeight: "bold",
                  borderWidth: 2,
                  marginTop: 2,
                  marginBottom: 1,
                  borderRadius: "30px",
                }}
                placeholder="Código"
                value={verificationCodeAdminLoginState || 0}
                onChange={(e) =>
                  dispatch(
                    setStateUser({
                      field: "verification_code",
                      value: e.target.value,
                    })
                  )
                }
                autoComplete="off"
                min={0}
              />
            </Form.Item>

            {isSubmittingConfirm ? (
              <div style={{ marginTop: "2px", marginBottom: "10px" }}>
                <CustomSpin />
              </div>
            ) : (
              <Button
                key={"confirm-code-button"}
                className="confirm-code-button"
                disabled={isPageLoadingState}
                size="middle"
                style={{
                  backgroundColor: isPageLoadingState ? "#D8D8D8" : "#015E90",
                  color: isPageLoadingState ? "#A0A0A0" : "#f2f2f2",
                  borderRadius: "31px",
                  marginBottom: "7px",
                }}
                htmlType="submit"
                onClick={handleButtonClick}
              >
                Confirmar código
              </Button>
            )}
          </Form>

          {resendCodeDisable && (
            <CountdownTimer
              onFinishHandler={() => {
                setResendCodeDisable(false);
              }}
              showCountdown={resendCodeDisable}
            />
          )}

          {isSubmittingResendCode && !resendCodeDisable ? (
            <CustomSpin />
          ) : (
            <Button
              key="resend-button-user"
              className="resend-button-user"
              disabled={resendCodeDisable}
              size="middle"
              style={{
                backgroundColor: resendCodeDisable ? "#D8D8D8" : "transparent",
                color: resendCodeDisable ? "#A7BAB7" : "#015E90",
                borderColor: resendCodeDisable ? "#A7AFBA" : "#015E90",
                paddingInline: 13,
                marginTop: 2,
                borderRadius: 31,
                borderWidth: 1.3,
              }}
              onClick={handleResentCode}
              onMouseDown={handleButtonClick}
            >
              Reenviar código
            </Button>
          )}

          <div style={{ marginInline: 54 }}>
            <Divider
              style={{
                marginBlock: 13,
                borderWidth: 2,
              }}
            />
          </div>

          <Button
            key="cancel-button-user"
            className="cancel-button-user"
            size="middle"
            style={{
              paddingInline: 45,
              backgroundColor: "#8C1111",
              color: "#f2f2f2",
              borderRadius: 31,
            }}
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserModalVerificationCode;
