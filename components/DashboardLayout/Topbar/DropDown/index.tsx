import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

const TopBarDropdownMenu = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const logoutAction = () => {
    logout();
    router.push('/login');
    toast('Successfully logged out', { closeButton: true, richColors: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex-1 min-w-0 cursor-pointer">
          <p className="truncate text-sm font-medium text-gray-900">{user?.email ?? ''}</p>
          <p className="truncate text-xs text-gray-500">{user?.name ?? ''}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={logoutAction}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TopBarDropdownMenu;
