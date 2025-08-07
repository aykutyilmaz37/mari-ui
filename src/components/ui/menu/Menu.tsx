"use client";
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
import Image from "next/image";
import { useRouter } from "next/navigation";

type MenuProps = {
  data: MenuItem[];
};

const iconMap: Record<string, React.ComponentType> = {
  MailIcon,
  AppWindowIcon,
  SettingsIcon,
  DatabaseIcon,
};

export const Menu: React.FC<MenuProps> = ({ data }) => {
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const navigate = useRouter();

  const handleNavigateMain = () => {
    navigate.push("/");
  };
  const handleNavigate = (route: string | undefined, key: string) => {
    navigate.push(route || '/');
    setActiveKey(key);
  };

  React.useEffect(() => {
    if (data.length > 0 && !activeKey) {
      setActiveKey(data[0].key);
    }
  }, [data, activeKey]);

  return (
    <div className="flex flex-row gap-4 bg-white sticky top-0 p-2 shadow-md">
      <Image
        className="cursor-pointer"
        onClick={handleNavigateMain}
        width={48}
        height={72}
        src="/images/fb.png"
        alt="fb"
      />
      {data.map((item) => {
        const IconComponent = item.iconName ? iconMap[item.iconName] : null;

        return (
          <Button
            key={item.key}
            onClick={() => handleNavigate(item.route, item.key)}
            className={twMerge(
              "cursor-pointer px-3 py-2 rounded-b-none transition justify-start",
              activeKey === item.key
                ? " text-primary border-b-2 border-info "
                : " hover:border-b-2 hover:border-info"
            )}
          >
            <div className="flex items-center gap-2">
              {IconComponent && <IconComponent />}
              <div>{item.label}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
