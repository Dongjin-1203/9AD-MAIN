import { ArrowRightOutlined } from '@ant-design/icons';
import Link from 'next/link';

export type MenuCardProps = {
  href?: string;
  menu: string;
};

export function MenuCard({ menu, href = '#' }: MenuCardProps) {
  return (
    <Link href={href}>
      <div
        className='flex flex-row p-4 items-center border-gray-500 border-y-2'
        style={{ backgroundColor: '#D0D0D0' }}
      >
        <p className='flex-1 text-4xl text-white'>{menu}</p>
        <ArrowRightOutlined />
      </div>
    </Link>
  );
}
