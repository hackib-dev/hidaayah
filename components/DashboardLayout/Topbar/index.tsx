'use client';

import { usePathname } from 'next/navigation';
import { BiMenu } from 'react-icons/bi';
import { useAuth } from '@/components/auth-provider';

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const email = user?.email ?? '';

  return (
    <nav className="flex items-center justify-between border-b-[1px] border-gray-200 bg-white md:p-1.5 lg:ml-60">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
        >
          <BiMenu size={20} />
        </button>

        <div className="flex items-center justify-between text-sm p-2">
          <div className="flex items-center gap-2">
            {!!pathname?.split('/')[2] ? (
              <>
                <p className="capitalize text-gray-400">Customers</p>
                <p>/</p>
                <p className="font-semibold capitalize">
                  {pathname.split('/')[2].split('-').join(' ')}
                </p>
              </>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{email || 'Welcome'}</p>
                <p className="text-xs text-gray-500">Welcome back to Starter Pack 👋🏻</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
