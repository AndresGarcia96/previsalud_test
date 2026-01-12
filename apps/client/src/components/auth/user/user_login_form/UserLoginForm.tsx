"use client";

import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import { Form, Input, Card } from "antd";
import { titleStyleCss } from "@/theme/text_styles";

import { UserOutlined } from "@ant-design/icons";
import { RiLockPasswordLine } from "react-icons/ri";

import UserModalVerificationCode from "../user_modal_verification_code/UserModalVerificationCode";
import CustomButton from "@/components/common/custom_button/CustomButton";
import CustomMessage from "@/components/common/custom_messages/CustomMessage";
import CustomSpin from "@/components/common/custom_spin/CustomSpin";

import { useLoginUserMutation } from "@/redux/apis/login_user/loginUserApi";

import { setStateUser, resetUser } from "@/redux/features/user/userSlice";
import { setUserModalIsOpen } from "@/redux/features/common/modal/modalSlice";

import { RolesEnum } from "@/utils/enums/roles/roles.enum";

const UserLoginForm: React.FC = () => {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  const errorsAdminState = useAppSelector((state) => state.user.errors);

  const userModalState = useAppSelector((state) => state.modal.userModalIsOpen);

  const [emailUserLocalState, setEmailUserLocalState] = useState("");
  const [passwordUserLocalState, setPasswordUserLocalState] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const [
    loginUser,
    {
      data: isLoginUserData,
      isLoading: isLoginUserLoading,
      isSuccess: isLoginUserSuccess,
      isError: isLoginUserError,
    },
  ] = useLoginUserMutation({
    fixedCacheKey: "loginUserData",
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === RolesEnum.USER) {
      signOut();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setIsSubmitting(true);
      dispatch(resetUser());

      const response: any = await loginUser({
        email: emailUserLocalState,
        password: passwordUserLocalState,
      });

      let isLoginUserError = response.error;
      let isLoginUserSuccess = response.data;
      let isLoginUserBan = response.data?.statusCode;

      if (isLoginUserError) {
        const errorMessage = isLoginUserError?.data.message;

        if (Array.isArray(errorMessage)) {
          dispatch(setStateUser({ field: "errors", value: errorMessage[0] }));
          setShowErrorMessage(true);
        } else if (typeof errorMessage === "string") {
          dispatch(setStateUser({ field: "errors", value: errorMessage }));
          setShowErrorMessage(true);
        }
      }
      if (isLoginUserBan === 202) {
        dispatch(
          setStateUser({ field: "errors", value: response.data?.message })
        );
        setShowErrorMessage(true);
      }

      if (isLoginUserSuccess && !isLoginUserError && !isLoginUserBan) {
        dispatch(setStateUser({ field: "email", value: emailUserLocalState }));
        dispatch(
          setStateUser({
            field: "cellphone",
            value: isLoginUserSuccess.cellphone,
          })
        );
        dispatch(
          setStateUser({ field: "password", value: passwordUserLocalState })
        );
        dispatch(setStateUser({ field: "errors", value: [] }));
        dispatch(setUserModalIsOpen(true));
        setShowErrorMessage(false);
      }
    } catch (error) {
      console.error(error);

      dispatch(
        setStateUser({ field: "errors", value: "Internal server error" })
      );
      setShowErrorMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    dispatch(setStateUser({ field: "errors", value: [] }));
    setShowErrorMessage(false);
  };

  return (
    <>
      {userModalState && <UserModalVerificationCode />}

      {showErrorMessage && (
        <CustomMessage
          typeMessage="error"
          message={errorsAdminState?.toString() || "¡Error en la petición!"}
        />
      )}

      <Card
        style={{
          width: "100%",
          minWidth: "405px",
          borderRadius: "13px",
          boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.2)",
          justifyContent: "center",
          alignItems: "center",
          padding: "13px",
        }}
      >
        <h2
          style={{
            ...titleStyleCss,
            textAlign: "center",
            marginBlock: "13px",
          }}
        >
          Iniciar Sesión Usuarios
        </h2>

        <Form
          id="login-form"
          className="login-form"
          onFinish={handleSubmit}
          autoComplete="false"
          initialValues={{ remember: false }}
        >
          <Form.Item
            id="login-email-form"
            className="login-email-form"
            name="login-email-form"
            normalize={(value) => {
              if (!value) return "";

              return value.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
            }}
            rules={[
              { required: true, message: "Por favor ingrese su correo" },
              {
                min: 5,
                message: "¡Por favor ingresa mínimo 5 caracteres!",
              },
              {
                max: 50,
                message: "¡Por favor ingresa máximo 50 caracteres!",
              },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Por favor ingrese un correo válido",
              },
            ]}
            hasFeedback
          >
            <Input
              className="email-input"
              type="email"
              placeholder="Correo"
              autoComplete="off"
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              value={emailUserLocalState}
              onChange={(e) =>
                setEmailUserLocalState(e.target.value.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            id="login-password-form"
            className="login-password-form"
            name="login-password-form"
            rules={[
              {
                required: true,
                message: "Por favor ingrese su contraseña",
              },
              {
                max: 70,
                message: "¡La contraseña debe tener máximo 70 caracteres!",
              },
            ]}
            hasFeedback
          >
            <Input.Password
              className="password-input"
              prefix={
                <RiLockPasswordLine style={{ color: "rgba(0,0,0,.22)" }} />
              }
              type="password"
              value={passwordUserLocalState}
              placeholder="Contraseña"
              onChange={(e) => setPasswordUserLocalState(e.target.value)}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            {isSubmitting && isLoginUserLoading ? (
              <CustomSpin />
            ) : (
              <CustomButton
                classNameCustomButton="user-admin-login-button"
                htmlTypeCustomButton="submit"
                typeCustomButton="primary"
                sizeCustomButton="middle"
                styleCustomButton={{
                  fontWeight: "bold",
                  paddingInline: "22px",
                }}
                shapeCustomButton="round"
                onClickCustomButton={handleButtonClick}
                titleCustomButton="Iniciar Sesión"
              />
            )}

            <h5
              className="version-number"
              style={{
                textAlign: "center",
                fontWeight: "bold",
                lineHeight: 1.3,
                marginTop: "22px",
                color: "#A7BAB7",
              }}
            >
              Versión: {process.env.NEXT_PUBLIC_APP_VERSION}
            </h5>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default UserLoginForm;
