import React, {
  createContext,
  use,
  useEffect,
  useReducer,
  useState,
  useCallback
} from 'react';
import { settings } from 'config';
import { getColor, getItemFromStore } from 'helpers/utils';
import useToggleStyle from 'hooks/useToggleStyle';
import { configReducer } from 'reducers/configReducer';
import companyService from 'services/companyService';
import {
  getDefaultCompanyTheme,
  saveCompaniesToStorage
} from 'helpers/companyTheme';

export const AppContext = createContext(settings);

const getHostname = () =>
  typeof window !== 'undefined' ? window.location.hostname : '';

const isRealDomain = host =>
  host &&
  host !== 'localhost' &&
  host !== '127.0.0.1' &&
  !/^\d{1,3}(\.\d{1,3}){3}$/.test(host);

const normalizeBranding = (company = {}) => ({
  ...getDefaultCompanyTheme(),
  ...(company || {}),
  name: company?.name || getDefaultCompanyTheme().name,
  logoUrl: company?.logoUrl || '',
  loginBackgroundUrl: company?.loginBackgroundUrl || '',
  loginFooter: company?.loginFooter || '',
  domain: company?.domain || ''
});

const AppProvider = ({ children }) => {
  const configState = {
    isFluid: getItemFromStore('isFluid', settings.isFluid),
    isRTL: getItemFromStore('isRTL', settings.isRTL),
    isDark: getItemFromStore('isDark', settings.isDark),
    theme: getItemFromStore('theme', settings.theme),
    navbarPosition: getItemFromStore('navbarPosition', settings.navbarPosition),
    disabledNavbarPosition: [],
    isNavbarVerticalCollapsed: getItemFromStore(
      'isNavbarVerticalCollapsed',
      settings.isNavbarVerticalCollapsed
    ),
    navbarStyle: 'inverted',
    currency: settings.currency,
    showBurgerMenu: settings.showBurgerMenu,
    showSettingPanel: false,
    navbarCollapsed: false,
    openAuthModal: false
  };

  const [config, configDispatch] = useReducer(configReducer, configState);
  const [branding, setBranding] = useState(() => normalizeBranding(getDefaultCompanyTheme()));

  const setConfig = (key, value) => {
    configDispatch({
      type: 'SET_CONFIG',
      payload: {
        key,
        value,
        setInStore: [
          'isFluid',
          'isRTL',
          'isDark',
          'theme',
          'navbarPosition',
          'isNavbarVerticalCollapsed'
        ].includes(key)
      }
    });
  };
  const { isLoaded } = useToggleStyle(config.isRTL, config.isDark);

  useEffect(() => {
    const isDark =
      config.theme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : config.theme === 'dark';

    setConfig('isDark', isDark);
  }, [config.theme]);

  const changeTheme = theme => {
    const isDark =
      theme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : theme === 'dark';

    document.documentElement.setAttribute(
      'data-bs-theme',
      isDark ? 'dark' : 'light'
    );

    setConfig('theme', theme);
    setConfig('isDark', isDark);
  };

  const getThemeColor = name => getColor(name);

  const refreshBranding = useCallback(async () => {
    const hostname = getHostname();
    if (!hostname || !isRealDomain(hostname)) {
      setBranding(normalizeBranding(getDefaultCompanyTheme()));
      return;
    }

    try {
      const company = await companyService.getByDomain(hostname);
      if (company && typeof company === 'object') {
        saveCompaniesToStorage([company]);
        setBranding(normalizeBranding(company));
      } else {
        setBranding(normalizeBranding(getDefaultCompanyTheme()));
      }
    } catch (error) {
      setBranding(normalizeBranding(getDefaultCompanyTheme()));
    }
  }, []);

  useEffect(() => {
    refreshBranding();
  }, [refreshBranding]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = branding?.name || getDefaultCompanyTheme().name;
    }
  }, [branding]);

  if (!isLoaded) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: config.isDark
            ? getThemeColor('dark')
            : getThemeColor('light')
        }}
      />
    );
  }

  return (
    <AppContext
      value={{
        config,
        setConfig,
        configDispatch,
        changeTheme,
        getThemeColor,
        branding,
        refreshBranding
      }}
    >
      {children}
    </AppContext>
  );
};


export const useAppContext = () => use(AppContext);

export default AppProvider;
