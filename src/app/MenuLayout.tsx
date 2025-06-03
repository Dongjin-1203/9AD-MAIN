'use client';

import {
  ContainerOutlined,
  DeleteOutlined,
  HomeOutlined,
  LikeOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SendOutlined,
  UnlockOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Button, ConfigProvider, Layout, Menu, MenuProps } from 'antd';
import locale from 'antd/locale/ko_KR';
import _ from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { useCallback, useMemo, useState } from 'react';
import { currentSoldier, signOut, hasPermission } from './actions';

const title = {
  '/points'           : '상점 관리',
  '/points/approval'  : '상벌점 승인',
  '/points/request'   : '상점 요청',
  '/points/give'      : '상점 부여',
  '/points/gift'      : '상벌점 소급',
  '/points/redeem'    : '상점 사용',
  '/soldiers/list'    : '유저 관리',
  '/soldiers/signup'  : '회원가입 관리',
};

function renderTitle(pathname: string) {
  if (pathname in title) {
    return title[pathname as keyof typeof title];
  }
  return 'The 9ood! M&D';
}

export function MenuLayout({
  data,
  children,
}: {
  data: Awaited<ReturnType<typeof currentSoldier>> | null;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const onClick: MenuClickEventHandler = useCallback(
    (info) => {
      router.replace(info.key);
      setCollapsed(true);
    },
    [router],
  );

  const onSignOut = useCallback(async () => {
    await signOut();
    router.replace('/auth/logout');
    setCollapsed(true);
  }, [router]);

  const items: MenuProps['items'] = useMemo(
    () =>
      data == null
        ? []
        : [
            {
              key: '/soldiers',
              label: data.name ?? '',
              icon: <UserOutlined />,
              onClick,
            },
            { key: '/', label: '홈', icon: <HomeOutlined />, onClick },

            hasPermission(data.permissions, [
              'Admin',
              'Commander',
              'UserAdmin',
            ]) ?
            {
              key: '/soldiers/#',
              label: '유저',
              icon: <UserOutlined />,
              children: [
                {
                  key: '/soldiers/list',
                  label: '유저 관리',
                  icon: <UserOutlined />,
                  onClick,
                },

                hasPermission(data.permissions, [
                  'Admin',
                  'Commander',
                  'UserAdmin',
                ])?
                {
                  key: '/soldiers/signup',
                  label: '회원가입 관리',
                  icon: <UserAddOutlined />,

                  onClick,
                } : null,
              ],
            } : null,
            {
              key: '/points/#',
              label: '상점',
              icon: <LikeOutlined />,
              children: [
                {
                  key: '/points',
                  label: '상점 관리',
                  icon: <ContainerOutlined />,
                  onClick,
                },

                data.type === 'enlisted' ?
                {
                  key: '/points/request',
                  label: '상점 요청',
                  icon: <MailOutlined />,
                  onClick,
                } : null,

                hasPermission(data.permissions, [
                  'Admin',
                  'Commander',
                  'UserAdmin',
                  'Nco',
                ]) ?
                {
                  key: '/points/give',
                  label: '상점 부여',
                  icon: <SendOutlined />,
                  onClick,
                } : null,
                hasPermission(data.permissions, [
                  'Admin',
                  'Commander',
                  'UserAdmin',
                  'Nco',
                ]) ?
                {
                  key: '/points/gift',
                  label: '상벌점 소급',
                  icon: <SendOutlined />,
                  onClick,
                } : null,
                hasPermission(data.permissions, [
                  'Commander',
                ]) ?
                {
                  key: '/points/approval',
                  label: '상벌점 승인',
                  icon: <SendOutlined />,
                  onClick,
                } : null,
                hasPermission(data.permissions, [
                  'Admin',
                  'Commander',
                ]) ?
                {
                  key: '/points/redeem',
                  label: '상점 사용',
                  icon: <DeleteOutlined />,
                  onClick,
                } : null,
              ],
            },
            {
              key: '/auth/logout',
              label: '로그아웃',
              icon: <UnlockOutlined />,
              danger: true,
              onClick: onSignOut,
            },
          ],
    [data, onClick, onSignOut],
  );

  const onClickMenu = useCallback(() => setCollapsed((state) => !state), []);

  const onClickContent = useCallback(() => setCollapsed((state) => !state ? !state : state), [])

  if (data == null) {
    if (pathname.startsWith('/auth')) {
      return children;
    }
    router.replace('/auth/login');
    return children;
  }

  return (
    <ConfigProvider locale={locale}>
      <App>
        <Layout style={{ minHeight: '100vh' }}>
          <Layout.Sider
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 60,
              bottom: 0,
              zIndex: 2,
            }}
            collapsible
            collapsed={collapsed}
            collapsedWidth={0}
            trigger={null}
          >
            <Menu
              theme='dark'
              mode='inline'
              items={items}
              selectedKeys={[pathname]}
            />
          </Layout.Sider>
          <Layout>
            <Layout.Header
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                display: 'flex',
                flexDirection: 'row',
                padding: 0,
                paddingLeft: 20,
                alignItems: 'center',
              }}
            >
              <Button
                type='text'
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={onClickMenu}
                style={{ color: '#FFF' }}
              />
              <p className='text-white font-bold text-xl ml-5'>
                {renderTitle(pathname)}
              </p>
            </Layout.Header>
            <Layout.Content onClick={onClickContent}>{children}</Layout.Content>
            <Layout.Footer style={{ textAlign: 'center' }}>
              <span className='text-black font-bold'>
                ©{new Date().getFullYear()} 제작: 9탄약창 본부중대장
              </span>
            </Layout.Footer>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
