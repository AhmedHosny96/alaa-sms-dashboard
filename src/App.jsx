import React, { useEffect } from 'react';
import is from 'is_js';
import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { Chart as ChartJS, registerables } from 'chart.js';
import { CloseButton } from 'components/common/Toast';
import SettingsToggle from 'components/settings-panel/SettingsToggle';
import SettingsPanel from 'components/settings-panel/SettingsPanel';
import { useAppContext } from 'providers/AppProvider';
import paths from 'routes/paths';
import { clearAuthToken, clearAuthUser, isTokenExpired } from 'components/authentication/authStorage';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import 'simplebar-react/dist/simplebar.min.css';

ChartJS.register(...registerables);

const App = () => {
  const HTMLClassList = document.getElementsByTagName('html')[0].classList;
  const {
    config: { navbarPosition }
  } = useAppContext();

  useEffect(() => {
    if (is.windows()) {
      HTMLClassList.add('windows');
    }
    if (is.chrome()) {
      HTMLClassList.add('chrome');
    }
    if (is.firefox()) {
      HTMLClassList.add('firefox');
    }
    if (is.safari()) {
      HTMLClassList.add('safari');
    }
  }, [HTMLClassList]);

  useEffect(() => {
    if (navbarPosition === 'double-top') {
      HTMLClassList.add('double-top-nav-layout');
    }
    return () => HTMLClassList.remove('double-top-nav-layout');
  }, [navbarPosition]);

  useEffect(() => {
    const checkExpiry = () => {
      if (isTokenExpired()) {
        clearAuthToken();
        clearAuthUser();
        window.location.href = paths.simpleLogin;
      }
    };
    checkExpiry();
    const intervalId = window.setInterval(checkExpiry, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      <Outlet />
      <SettingsToggle />
      <SettingsPanel />
      <ToastContainer
        closeButton={CloseButton}
        icon={false}
        position="bottom-left"
      />
    </>
  );
};

export default App;
