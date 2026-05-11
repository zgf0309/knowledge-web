import { LogoutOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { flushSync } from 'react-dom';
import { outLogin } from '@/services/user/api';
import HeaderDropdown from '../HeaderDropdown';
import { StorageKeys, removeLocalStorage } from '@/utils/storage';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};

  console.log('currentUser====>', currentUser);
  return <span className="anticon">{currentUser?.name || currentUser?.username || '用户'}</span>;
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ children }) => {
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    const res: any = await outLogin({
      id_token_hint: localStorage.getItem(StorageKeys.ACCESS_TOKEN) || '',
      redirect_url: window.location.origin + window.location.pathname,
    });
    console.log('res123======>', res);
    const { code, data } = res;
    if (code === 200) {
      flushSync(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      removeLocalStorage(StorageKeys.CURRENT_USER);
      removeLocalStorage(StorageKeys.ACCESS_TOKEN);
      removeLocalStorage(StorageKeys.REFRESH_TOKEN);
      window.location.href = data?.logout_url;
    }
  };

  const { styles } = useStyles();

  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'logout') {
      loginOut();
      return;
    }
    history.push(`/account/${key}`);
  };

  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser) {
    return loading;
  }
  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
