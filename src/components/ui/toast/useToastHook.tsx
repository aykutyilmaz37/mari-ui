import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, InfoIcon } from "lucide-react";

export const getType = (type: string) => {
    switch (type) {
      case "error":
        return <CircleXIcon className="fill-error stroke-white" />;
      case "success":
        return <CircleCheckIcon className="fill-success stroke-white" />;
      case "warning":
        return <CircleAlertIcon className="fill-warning stroke-white" />;
      case "info":
        return <InfoIcon className="fill-info stroke-white" />;
      default:
        return null;
    }
  };