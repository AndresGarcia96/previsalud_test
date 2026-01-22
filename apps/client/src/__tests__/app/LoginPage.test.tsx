import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "@/utils/test-utils";
import "@testing-library/jest-dom";
import "@/__mocks__/apiMocks";

jest.mock("@/components/auth/user/user_login_form/UserLoginForm", () => {
  return {
    __esModule: true,
    default: function MockUserLoginForm() {
      return (
        <form data-testid="formulario-usuario">
          <input
            type="email"
            placeholder="Correo electrónico"
            data-testid="input-email-usuario"
          />
          <input
            type="password"
            placeholder="Contraseña"
            data-testid="input-password-usuario"
          />
          <button type="submit" data-testid="boton-enviar-usuario">
            Iniciar Sesión Usuario
          </button>
        </form>
      );
    },
  };
});

jest.mock("@/components/auth/admin/admin_login_form/AdminLoginForm", () => {
  return {
    __esModule: true,
    default: function MockAdminLoginForm() {
      return (
        <form data-testid="formulario-admin">
          <input
            type="email"
            placeholder="Correo electrónico"
            data-testid="input-email-admin"
          />
          <input
            type="password"
            placeholder="Contraseña"
            data-testid="input-password-admin"
          />
          <button type="submit" data-testid="boton-enviar-admin">
            Iniciar Sesión Admin
          </button>
        </form>
      );
    },
  };
});

import UsersLoginPage from "@/app/login/page";

describe("Página de Login de Usuarios", () => {
  const estadoInicialMock = {
    user: {},
    modal: {
      isPageLoading: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Renderizado de la Página", () => {
    it("debería renderizar la página de login con todos sus elementos", async () => {
      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      await waitFor(() => {
        const logo = screen.getByAltText("Logo de Fenix");
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute(
          "src",
          "/logos/fenix-ver-naranja-sin-fondo-ok.png",
        );
      });

      expect(screen.getByText("Usuarios")).toBeInTheDocument();
      expect(screen.getByText("Administradores")).toBeInTheDocument();
    });

    it("debería renderizar con imagen de fondo", async () => {
      const { container } = await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      const fondoDePagina = container.querySelector(".background-page");
      expect(fondoDePagina).toBeInTheDocument();
    });

    it("debería mostrar el formulario de usuario por defecto", async () => {
      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      await waitFor(() => {
        expect(screen.getByTestId("formulario-usuario")).toBeInTheDocument();
      });
    });
  });

  describe("Navegación entre Pestañas", () => {
    it("debería cambiar al formulario de administrador al hacer clic en la pestaña", async () => {
      const usuario = userEvent.setup();

      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      const pestañaAdmin = screen.getByText("Administradores");
      await usuario.click(pestañaAdmin);

      await waitFor(() => {
        expect(screen.getByTestId("formulario-admin")).toBeInTheDocument();
      });
    });

    it("debería volver al formulario de usuario al hacer clic en la pestaña de usuarios", async () => {
      const usuario = userEvent.setup();

      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      const pestañaAdmin = screen.getByText("Administradores");
      await usuario.click(pestañaAdmin);

      const pestañaUsuario = screen.getByText("Usuarios");
      await usuario.click(pestañaUsuario);

      await waitFor(() => {
        expect(screen.getByTestId("formulario-usuario")).toBeInTheDocument();
      });
    });
  });

  describe("Gestión del Estado de Redux", () => {
    it("debería tener el estado de carga de página deshabilitado inicialmente", async () => {
      const { store } = await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      expect(store.getState().modal.isPageLoading).toBe(false);
    });
  });

  describe("Integración con Formularios de Autenticación", () => {
    it("debería renderizar el formulario de usuario con sus campos", async () => {
      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      await waitFor(() => {
        expect(screen.getByTestId("input-email-usuario")).toBeInTheDocument();
        expect(
          screen.getByTestId("input-password-usuario"),
        ).toBeInTheDocument();
        expect(screen.getByTestId("boton-enviar-usuario")).toBeInTheDocument();
      });
    });

    it("debería renderizar el formulario de admin cuando la pestaña está activa", async () => {
      const usuario = userEvent.setup();

      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      const pestañaAdmin = screen.getByText("Administradores");
      await usuario.click(pestañaAdmin);

      await waitFor(() => {
        expect(screen.getByTestId("input-email-admin")).toBeInTheDocument();
        expect(screen.getByTestId("input-password-admin")).toBeInTheDocument();
        expect(screen.getByTestId("boton-enviar-admin")).toBeInTheDocument();
      });
    });

    it("debería mostrar los botones de envío correctamente etiquetados", async () => {
      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      await waitFor(() => {
        const botonUsuario = screen.getByTestId("boton-enviar-usuario");
        expect(botonUsuario).toHaveTextContent("Iniciar Sesión Usuario");
      });
    });
  });

  describe("Elementos Visuales y Estilos", () => {
    it("debería renderizar el logo con el tamaño correcto", async () => {
      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      await waitFor(() => {
        const logo = screen.getByAltText("Logo de Fenix");
        expect(logo).toHaveStyle({ height: "77px" });
      });
    });

    it("debería tener la estructura de layout correcta", async () => {
      const { container } = await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      const contenedorPrincipal = container.querySelector(
        '[style*="display: flex"]',
      );
      expect(contenedorPrincipal).toBeInTheDocument();

      const contenedorContenido = container.querySelector(".content-page");
      expect(contenedorContenido).toBeInTheDocument();
    });
  });

  describe("Accesibilidad", () => {
    it("debería tener una imagen con texto alternativo descriptivo", async () => {
      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      await waitFor(() => {
        const logo = screen.getByAltText("Logo de Fenix");
        expect(logo).toHaveAccessibleName("Logo de Fenix");
      });
    });

    it("debería tener pestañas navegables", async () => {
      await renderWithProviders(<UsersLoginPage />, {
        preloadedState: estadoInicialMock,
      });

      const pestañaUsuarios = screen.getByText("Usuarios");
      const pestañaAdmin = screen.getByText("Administradores");

      expect(pestañaUsuarios).toBeEnabled();
      expect(pestañaAdmin).toBeEnabled();
    });
  });
});
