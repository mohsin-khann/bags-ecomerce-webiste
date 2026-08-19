import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const DEFAULTS = {
  storeName: "Maison de Sac",
  storeTagline: "Luxury Bags & Accessories",
  logoMain: "",
  footerText: "",
  contactEmail: "",
  contactPhone: "",
  storeAddress: "",
  workingHours: "",
  primaryColor: "#d97706",
};

const SettingsContext = createContext({ settings: DEFAULTS, loading: true, refresh: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const applySettings = (s = {}) => {
    const w = s.website || {};
    const c = s.contact || {};
    const a = s.appearance || {};
    setSettings({
      storeName:     w.storeName     || DEFAULTS.storeName,
      storeTagline:  w.storeTagline  || DEFAULTS.storeTagline,
      logoMain:      a.logoMain      || "",
      footerText:    w.footerText    || "",
      contactEmail:  w.contactEmail  || c.email  || "",
      contactPhone:  w.contactPhone  || c.phone  || "",
      storeAddress:  c.address       || "",
      workingHours:  c.workingHours  || "",
      primaryColor:  a.primaryColor  || DEFAULTS.primaryColor,
    });
  };

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get("/settings/public");
      applySettings(data.settings || {});
    } catch {
      // Keep defaults if backend is offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
