import { AvatarDropdown, AvatarName, Footer, Question } from '@/components';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import '@ant-design/v5-patch-for-react-19';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { useEffect } from 'react';

type MicroAppProps = {
  storagePrefix?: string;
  subAppName?: string;
  settings?: any;
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

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (_error) {
      history.push(loginPath);
    }
    return undefined;
  };
 
  // 如果不是登录页面，执行
  const { location } = history;
  if (![loginPath, '/user/register', '/user/register-result'].includes(location.pathname)) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const settings = (initialState?.settings ?? defaultSettings) as RuntimeLayoutSettings;
  const colorPrimary = String(settings.colorPrimary ?? fallbackPrimaryColor);
  const layoutToken = createLayoutToken(colorPrimary);
  const settingsToken = settings.token ?? {};
  const currentWindow = getWindowObject();
    useEffect(() => {
    if (currentWindow?.$wujie) {
      const bus = currentWindow?.$wujie?.bus;
      if (bus) {
        // 接收更新指令
        bus.$on('force-sub-update', (data: any) => {
          console.log('收到强制更新123', data?.settings);
          console.log('收到强制更新456', data?.userInfo);
          setInitialState((s) => ({
            ...s,
            settings: data?.settings,
            currentUser: data?.userInfo,
          }));
        });
      }
    }
  }, [currentWindow?.$wujie]);
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
      const { location } = history;
      console.log('onPageChange', initialState);
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
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
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
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
  baseURL: 'https://proapi.azurewebsites.net',
  ...errorConfig,
};
