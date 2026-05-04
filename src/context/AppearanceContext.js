import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";

export const configuracionInicial = {
  tema: "claro",
  notificacionesPromociones: true,
  notificacionesPedidos: true,
  vistaCompacta: false,
};

const AppearanceContext = createContext();

export const useAppearance = () => useContext(AppearanceContext);

const getStorageKey = (user) =>
  user
    ? `configuracion_ventas_perrunas_${user.id}`
    : "configuracion_ventas_perrunas_invitado";

export const AppearanceProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const storageKey = useMemo(() => getStorageKey(user), [user]);
  const [configuracion, setConfiguracion] = useState(configuracionInicial);

  useEffect(() => {
    const savedConfig = localStorage.getItem(storageKey);

    if (!savedConfig) {
      setConfiguracion(configuracionInicial);
      return;
    }

    try {
      setConfiguracion({
        ...configuracionInicial,
        ...JSON.parse(savedConfig),
      });
    } catch (error) {
      localStorage.removeItem(storageKey);
      setConfiguracion(configuracionInicial);
    }
  }, [storageKey]);

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)",
      ).matches;
      const resolvedTheme =
        configuracion.tema === "automatico"
          ? prefersDark
            ? "oscuro"
            : "claro"
          : configuracion.tema;

      document.body.classList.remove(
        "tema-claro",
        "tema-oscuro",
        "tema-automatico",
        "vista-compacta",
      );

      document.body.classList.add(`tema-${configuracion.tema}`);
      document.body.dataset.theme = resolvedTheme;
      document.documentElement.dataset.theme = resolvedTheme;

      if (configuracion.vistaCompacta) {
        document.body.classList.add("vista-compacta");
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    mediaQuery?.addEventListener?.("change", applyTheme);

    return () => {
      mediaQuery?.removeEventListener?.("change", applyTheme);
    };
  }, [configuracion]);

  const actualizarConfiguracion = useCallback((campo, valor) => {
    setConfiguracion((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }, []);

  const guardarConfiguracion = useCallback(() => {
    localStorage.setItem(storageKey, JSON.stringify(configuracion));
  }, [configuracion, storageKey]);

  const restablecerConfiguracion = useCallback(() => {
    setConfiguracion(configuracionInicial);
    localStorage.setItem(storageKey, JSON.stringify(configuracionInicial));
  }, [storageKey]);

  const value = useMemo(
    () => ({
      configuracion,
      actualizarConfiguracion,
      guardarConfiguracion,
      restablecerConfiguracion,
    }),
    [
      configuracion,
      actualizarConfiguracion,
      guardarConfiguracion,
      restablecerConfiguracion,
    ],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
};
