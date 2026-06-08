import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import { useAppContext } from 'providers/AppProvider';

const DEFAULT_SIDEBAR_LOGO = 'https://res.cloudinary.com/dcl6ngwgi/image/upload/v1771406940/35_mtqxndqwmtqwnja5nc5qcgc_Converted_Recovered_2_hiuj35.png';

const Logo = ({
  at = 'auth',
  //width = at === 'navbar-vertical' ? 180 : 58,
  width = 300,
  className,
  textClass,
  logoSrc,
  text = 'SMS Pro',
  ...rest
}) => {
  const { branding } = useAppContext();
  const resolvedLogo = logoSrc || branding?.logoUrl || DEFAULT_SIDEBAR_LOGO;
  const resolvedText = text === 'SMS Pro' ? branding?.name || 'SMS Pro' : text;

  return (
    <Link
      to="/"
      className={classNames(
        'text-decoration-none',
        { 'navbar-brand text-left': at === 'navbar-vertical' },
        { 'navbar-brand text-left': at === 'navbar-top' }
      )}
      {...rest}
    >
      <div
        className={classNames(
          'd-flex',
          {
            'align-items-center py-3': at === 'navbar-vertical',
            'align-items-center': at === 'navbar-top',
            'flex-center fw-bolder fs-4 mb-4': at === 'auth'
          },
          className
        )}
      >
        <img
          className="me-2"
          src={resolvedLogo}
          alt="Logo"
          style={
            at === 'navbar-top' || at === 'navbar-vertical'
              ? { height: `${width}px`, width: 'auto', maxWidth: '160px', objectFit: 'contain' }
              : { width }
          }
        />
        {(at !== 'navbar-vertical') && (
          <span className={classNames('font-sans-serif', textClass)} style={at === 'navbar-top' ? { fontSize: '1.2rem', fontWeight: 600 } : undefined}>{resolvedText}</span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
