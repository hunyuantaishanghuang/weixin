import React from "react";
import { PageRoute, AppTheme } from "../types";
import { Home, UtensilsCrossed, BookHeart, MessageCircleHeart, Dices } from "lucide-react";

interface BottomNavBarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  pendingOrdersCount: number;
  unreadMessagesCount?: number;
  theme?: AppTheme;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentPage,
  onNavigate,
  pendingOrdersCount,
  theme = "pink",
}) => {
  const isBlue = theme === "blue";
  const tabs = [
    {
      id: "home" as PageRoute,
      label: "首页",
      icon: Home,
    },
    {
      id: "adventure" as PageRoute,
      label: "大冒险",
      icon: Dices,
    },
    {
      id: "menu" as PageRoute,
      label: "点菜",
      icon: UtensilsCrossed,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: "diary" as PageRoute,
      label: "心情日历",
      icon: BookHeart,
    },
    {
      id: "message" as PageRoute,
      label: "留言板",
      icon: MessageCircleHeart,
    },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t transition-colors ${
      isBlue
        ? "bg-white/95 border-blue-100/90 shadow-[0_-4px_20px_rgba(37,99,235,0.06)]"
        : "bg-white/95 border-pink-100/90 shadow-[0_-4px_20px_rgba(255,107,129,0.06)]"
    }`}>
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;

          const activeColor = isBlue ? "text-blue-600" : "text-[#FF5370]";
          const activeBg = isBlue ? "bg-blue-600" : "bg-[#FF5370]";

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 select-none active:scale-95 transition-transform relative cursor-pointer group"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? `${activeColor} scale-110 stroke-[2.4]`
                      : "text-gray-400 group-hover:text-gray-600 stroke-[1.8]"
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className={`absolute -top-1 -right-2 ${activeBg} text-white text-[9px] font-bold rounded-full h-3.5 min-w-[14px] px-1 flex items-center justify-center leading-none shadow-xs`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium tracking-tight transition-colors ${
                  isActive ? `${activeColor} font-semibold` : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className={`absolute bottom-1 w-1 h-1 rounded-full ${activeBg}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
