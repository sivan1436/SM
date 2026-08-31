import react from "react";
import { menuItemsData } from "../assets/assets";
import { Icon } from "lucide-react";
import { NavLink } from "react-router-dom"; 



function MenuItems({setSideBarOpen}) {
    return (
<div className="px-6 text-gray-600 space-y-1 font-medium">
  {menuItemsData.map(({ to, label, Icon }) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/"}
      onClick={() => setSideBarOpen(false)}
      className={({ isActive }) =>
        `px-3.5 flex items-center gap-3 rounded-xl ${
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "hover:bg-gray-50"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  ))}
</div>

    );
};

export default MenuItems;