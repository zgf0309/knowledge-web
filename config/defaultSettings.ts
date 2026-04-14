import type { ProLayoutProps } from '@ant-design/pro-components';

const DEFAULT_LOGO_PATH = '/api/logo.svg';

const defaultLayoutSettings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  "navTheme": "light",
  "colorPrimary": "#1890ff",
  "layout": "mix",
  "contentWidth": "Fluid",
  "fixedHeader": true,
  "fixSiderbar": true,
  "pwa": true,
  "logo": DEFAULT_LOGO_PATH,
  "token": {},
  "splitMenus": false,
  "menuHeaderRender": false,
  "footerRender": false
};

const getChildLayoutSettings = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const storedSettings = window.localStorage.getItem('childLayoutSettings');
  console.log('storedSettings', storedSettings);
  if (!storedSettings) {
    return undefined;
  }

  try {
    return JSON.parse(storedSettings) as Partial<typeof defaultLayoutSettings>;
  } catch (_error) {
    return undefined;
  }
};
/**
 * @name
 */
const Settings: typeof defaultLayoutSettings = {
  ...defaultLayoutSettings,
  ...getChildLayoutSettings(),
};

export default Settings;