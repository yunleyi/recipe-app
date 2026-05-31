import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Shield, ChefHat, Heart, PenSquare } from 'lucide-react';

interface UserMenuProps {
  onNewRecipe?: () => void;
  onProfile?: () => void;
  onFavorites?: () => void;
  onMyRecipes?: () => void;
  onSettings?: () => void;
  onAdmin?: () => void;
  onReview?: () => void;
}

export function UserMenu({
  onNewRecipe,
  onProfile,
  onFavorites,
  onMyRecipes,
  onSettings,
  onAdmin,
  onReview,
}: UserMenuProps) {
  const { user, isAdmin, logout } = useAuth();

  // 用户头像：取用户名首字
  const avatar = user?.username?.charAt(0)?.toUpperCase() || 'U';

  // 头像颜色 - 管理员用橙色，普通用户用蓝色
  const avatarColor = isAdmin
    ? 'bg-orange-500 text-white'
    : 'bg-blue-500 text-white';

  return (
    <div className="flex items-center gap-2">
      {/* 新建菜谱按钮 */}
      {onNewRecipe && (
        <button
          onClick={onNewRecipe}
          className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[13px] font-medium transition-colors"
        >
          <PenSquare size={14} />
          <span>新建菜谱</span>
        </button>
      )}

      {/* 用户头像下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-full ${avatarColor} text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-white shadow-sm`}
            title={user?.username}
          >
            {avatar}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {/* 用户信息头部 */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-medium rounded-full">
                    <Shield size={9} /> 管理员
                  </span>
                )}
              </div>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* 个人功能 - 所有用户通用 */}
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer" onClick={onProfile}>
              <User className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={onFavorites}>
              <Heart className="mr-2 h-4 w-4" />
              <span>我的收藏</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={onMyRecipes}>
              <ChefHat className="mr-2 h-4 w-4" />
              <span>我的菜谱</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          {/* 管理员专属功能 */}
          {isAdmin && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" onClick={onAdmin}>
                  <Shield className="mr-2 h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 font-medium">管理后台</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={onReview}>
                  <PenSquare className="mr-2 h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 font-medium">菜谱审核</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}

          {/* 设置与退出 */}
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer" onClick={onSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>设置</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
