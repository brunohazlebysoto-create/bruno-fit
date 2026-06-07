import React, { createContext, useContext, useEffect, useState } from "react";
import tokens from "../../design-tokens.json";

const ThemeContext = createContext();
const THEME_STORAGE_KEY = "bruno_theme";

function applyTheme(themeVars = {}) {
if (!document || !document.documentElement) return;
Object.keys(themeVars).forEach(k => {
document.documentElement.style.setProperty(k, themeVars[k]);
});
}

export function ThemeProvider({ children }) {
const [themeName, setThemeName] = useState(() => {
try { return localStorage.getItem(THEME_STORAGE_KEY) || "Dark Modern"; } catch (e) { return "Dark Modern"; }
});

useEffect(() => {
const themeVars = tokens[themeName] || tokens["Dark Modern"];
applyTheme(themeVars);
try { localStorage.setItem(THEME_STORAGE_KEY, themeName); } catch(e) {}
}, [themeName]);

useEffect(() => {
// si no hay tema guardado, usar preferencia del sistema para elegir light/dark
try {
const saved = localStorage.getItem(THEME_STORAGE_KEY);
if (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
setThemeName("Neutral Clean");
}
} catch(e) {}
}, []);

const value = {
themeName,
themes: Object.keys(tokens),
setTheme: setThemeName,
restoreDefault: () => setThemeName("Dark Modern")
};

return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
return useContext(ThemeContext);
}

export default ThemeProvider;
