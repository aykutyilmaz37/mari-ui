import React from "react";
import { MenuItem } from "./types";
import {
  AppWindowIcon,
  DatabaseIcon,
  MailIcon,
  SettingsIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Button } from "../button";

type MenuProps = {
  data: MenuItem[];
  mode: "horizontal" | "vertical";
};

const iconMap: Record<string, React.ComponentType> = {
  MailIcon,
  AppWindowIcon,
  SettingsIcon,
  DatabaseIcon,
};

export const Menu: React.FC<MenuProps> = ({ mode, data }) => {
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (data.length > 0 && !activeKey) {
      setActiveKey(data[0].key);
    }
  }, [data, activeKey]);

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      const IconComponent = item.iconName ? iconMap[item.iconName] : null;

      return (
        <Button
        size="large"
          key={item.key}
          onClick={() => setActiveKey(item.key)}
          className={twMerge(
            "cursor-pointer px-3 py-2 rounded-b-none transition",
            activeKey === item.key
              ? "bg-secondary-light text-primary border-b-2 border-info "
              : "hover:bg-secondary-light hover:border-b-2 hover:border-info"
          )}
        >
          <span className="flex items-center gap-2">
            {IconComponent && <IconComponent />}
            <span>{item.label}</span>
          </span>
        </Button>
      );
    });
  };

  return (
    <div
      className={twMerge(
        "flex flex-row gap-1",
        mode === "vertical" && "flex-col",
        mode === "horizontal" && "flex-row "
      )}
    >
      {renderMenuItems(data)}
    </div>
  );
};
