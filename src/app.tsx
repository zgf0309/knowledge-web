import { AvatarDropdown, AvatarName, Footer, Question } from '@/components';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import ReactQueryProvider from '@/ReactQueryProvider';
import '@ant-design/v5-patch-for-react-19';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { useEffect } from 'react';
import {StorageKeys, getLocalStorage, setLocalStorage  } from './utils/storage';
import { ssoCallback } from '@/services/user/api';
import { redirectToLogin, clearRedirectFlag } from './utils/redirectUrl';
console.log('defaultSettings in app.tsx=====>', defaultSettings);

type MicroAppProps = {
  storagePrefix?: string;
  subAppName?: string;
  token?: string;
  refresh_token?: string;
  settings?: any;
  userInfo?: any;
};
type WujieWindow = Window & {
  $wujie?: {
    props?: MicroAppProps;
    bus: any;
  };
  __KNOWLEDGE_APP_STORAGE_PATCHED__?: boolean;
};
const getWindowObject = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window as WujieWindow;
};
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

const fallbackPrimaryColor = '#1677ff';

type RuntimeLayoutSettings = Partial<LayoutSettings> & {
  colorPrimary?: string;
  token?: {
    header?: Record<string, string>;
    sider?: Record<string, string>;
  };
};

const createLayoutToken = (colorPrimary: string) => {
  return {
    header: {
      colorTextMenuActive: colorPrimary,
      colorTextMenuSelected: colorPrimary,
      colorBgMenuItemHover: 'none',
      // colorBgMenuItemSelected: selectedBackground,
    },
    sider: {
      colorTextMenuActive: colorPrimary,
      colorTextMenuSelected: colorPrimary,
      colorTextSubMenuSelected: colorPrimary,
      // colorBgMenuItemHover: selectedBackground,
      // colorBgMenuItemSelected: selectedBackground,
    },
  };
};

const resolveLayoutSettings = (
  initialSettings?: Partial<LayoutSettings>,
): RuntimeLayoutSettings => {
  const currentSettings = (initialSettings ?? {}) as RuntimeLayoutSettings;
  const defaults = defaultSettings as RuntimeLayoutSettings;

  return {
    ...defaults,
    ...currentSettings,
    token: {
      ...(defaults.token ?? {}),
      ...(currentSettings.token ?? {}),
      header: {
        ...(defaults.token?.header ?? {}),
        ...(currentSettings.token?.header ?? {}),
      },
      sider: {
        ...(defaults.token?.sider ?? {}),
        ...(currentSettings.token?.sider ?? {}),
      },
    },
  };
};

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: (code: string, state: string) => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async (code: string, state: string) => {
    try {
      const res: any = await ssoCallback({ code, state });
      console.log('res=====>', res);
      if (res?.code === 200) {
        window.history.replaceState({}, '', window.location.pathname);
        return res?.data;
      } else {
        return undefined;
      }
    } catch (_error) {
      return undefined;
    }
   
  };
  const accessToken = getLocalStorage(StorageKeys.ACCESS_TOKEN);
  console.log('accessToken in getInitialState=====>', accessToken);
  if (accessToken) {
    const userInfo: any = getLocalStorage(StorageKeys.CURRENT_USER);
    return {
      currentUser: userInfo ? JSON.parse(userInfo) : undefined,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const code = urlParams.get('code');
    if (code && state) {
      // 登录成功回调，清除跳转锁
      const userInfo: any = await fetchUserInfo(code, state);
      if (userInfo) {
        const currentUser = userInfo?.user_info;
        setLocalStorage(StorageKeys.CURRENT_USER, userInfo?.user_info || '');
        setLocalStorage(StorageKeys.ACCESS_TOKEN, userInfo?.access_token || '');
        // 登录失败，清除跳转锁
        clearRedirectFlag();
        return {
          fetchUserInfo,
          currentUser,
          settings: defaultSettings as Partial<LayoutSettings>,
        };
      } else {
        // 登录失败，清除跳转锁
        clearRedirectFlag();
        return {
          fetchUserInfo,
          settings: defaultSettings as Partial<LayoutSettings>,
        };
      }
    } else {
       // 登录失败，清除跳转锁
      clearRedirectFlag();
      const user = getLocalStorage(StorageKeys.CURRENT_USER) || null;
      if (user) {
        return {
          fetchUserInfo,
          currentUser: user,
          settings: defaultSettings as Partial<LayoutSettings>,
        };
      } else {
        return {
          fetchUserInfo,
          settings: defaultSettings as Partial<LayoutSettings>,
        };
      }
    }
  }
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  console.log('initialState-settings in layout=====>', initialState?.settings);
  const settings = resolveLayoutSettings(initialState?.settings);
  const colorPrimary = String(settings.colorPrimary ?? fallbackPrimaryColor);
  const layoutToken = createLayoutToken(colorPrimary);
  const settingsToken = settings.token ?? {};
  const currentWindow = getWindowObject();
  const props = currentWindow?.$wujie?.props;
    useEffect(() => {
    if (props?.token) {
      setLocalStorage(StorageKeys.ACCESS_TOKEN, props.token);
    }
    if (props?.refresh_token) {
      setLocalStorage(StorageKeys.REFRESH_TOKEN, props.refresh_token);
    }
    if (props?.userInfo) {
      setLocalStorage(StorageKeys.CURRENT_USER, JSON.stringify(props.userInfo));
    }
    if (currentWindow?.$wujie) {
      const bus = currentWindow?.$wujie?.bus;
      if (bus) {
        // 接收更新指令
        bus.$on('force-sub-update', (data: any) => {
          console.log('收到强制更新', data);
          console.log('收到强制更新123', data?.settings);
          console.log('收到强制更新456', data?.userInfo);
          setInitialState((s) => ({
            ...s,
            settings: {
              ...(defaultSettings as Partial<LayoutSettings>),
              ...(data?.settings ?? {}),
            },
            currentUser: data?.userInfo,
          }));
        });
      }
    }
  }, [currentWindow?.$wujie, props?.token, props?.refresh_token, props?.userInfo]);
  return {
    actionsRender: () => [<Question key="doc" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      console.log('onPageChange', initialState);
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && !getLocalStorage(StorageKeys.ACCESS_TOKEN)) {
        // redirectToLogin();
      }
    },
    bgLayoutImgList: [],
    links: [],
     contentStyle: {
      paddingBlock: '0px',
      paddingInline: '0px',
      background: '#fff',
      minHeight: 'calc(100vh - 56px)',
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
        <ReactQueryProvider>
          {children}
            </ReactQueryProvider>
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={settings}
              onSettingChange={(nextSettings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings: {
                    ...(defaultSettings as Partial<LayoutSettings>),
                    ...nextSettings,
                  },
                }));
              }}
            />
          )}
        </>
      );
    },
    ...settings,
    token: {
      ...settingsToken,
      header: {
        ...(settingsToken.header ?? {}),
        ...layoutToken.header,
      },
      sider: {
        ...(settingsToken.sider ?? {}),
        ...layoutToken.sider,
      },
    },
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL: '', //'https://proapi.azurewebsites.net',
  ...errorConfig,
};
