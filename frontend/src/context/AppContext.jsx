import React, { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "deliverShieldState";
const TOKEN_KEY = "deliverShieldToken";

const initialState = {
  isLoggedIn: false,
  token: "",
  user: null,
  activePlan: null,
  selectedPlan: null,
  premiumPaid: 0,
  weeklyCoverage: 0,
  status: "Safe",
  payouts: [],
  latestPayout: null
};

const AppContext = createContext(null);

const readInitialState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const token = localStorage.getItem(TOKEN_KEY) || "";

  if (!saved) {
    return initialState;
  }

  try {
    return { ...initialState, ...JSON.parse(saved), token };
  } catch (error) {
    return initialState;
  }
};

const persist = (nextState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

  if (nextState.token) {
    localStorage.setItem(TOKEN_KEY, nextState.token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(readInitialState);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const navigate = useNavigate();

  const actions = useMemo(
    () => ({
      login: (data, options = {}) => {
        const { redirectTo = "/dashboard", isAdmin = false } = options;
        if (isAdmin) {
          localStorage.setItem("isAdmin", "true");
        } else {
          localStorage.removeItem("isAdmin");
        }
        setState((prev) => {
          const next = {
            ...prev,
            isLoggedIn: true,
            token: data.token || "",
            user: data.user
          };
          persist(next);
          return next;
        });
        setToast({ message: "Welcome to DeliverShield AI", type: "success" });
        navigate(redirectTo);
      },
      logout: () => {
        setState(initialState);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("isAdmin");
        navigate("/");
      },
      setSelectedPlan: (plan) => {
        setState((prev) => {
          const next = { ...prev, selectedPlan: plan };
          persist(next);
          return next;
        });
      },
      activatePlan: (activatedPlan) => {
        setState((prev) => {
          const planToUse = activatedPlan || prev.selectedPlan;
          if (!planToUse) return prev;

          const next = {
            ...prev,
            activePlan: planToUse,
            premiumPaid: planToUse.premium,
            weeklyCoverage: planToUse.coverage
          };
          persist(next);
          return next;
        });

        setToast({ message: "Plan activated successfully", type: "success" });
        navigate("/dashboard");
      },
      setStatus: (status) => {
        setState((prev) => {
          const next = { ...prev, status };
          persist(next);
          return next;
        });
      },
      addPayout: (payout) => {
        setState((prev) => {
          const next = {
            ...prev,
            latestPayout: payout,
            payouts: [payout, ...prev.payouts]
          };
          persist(next);
          return next;
        });
      },
      setPayoutHistory: (list) => {
        setState((prev) => {
          const next = { ...prev, payouts: list, latestPayout: list[0] || prev.latestPayout };
          persist(next);
          return next;
        });
      },
      notify: (message, type = "success") => setToast({ message, type }),
      clearToast: () => setToast({ message: "", type: "success" })
    }),
    [navigate]
  );

  const value = useMemo(() => ({ state, toast, actions }), [state, toast, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
};
