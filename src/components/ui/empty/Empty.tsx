import { FileWarning } from "lucide-react";
import React from "react";
import { Button } from "../button";

type EmptyProps = {
  title: string;
  description?: string;
  buttonText?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  buttonIcon?: React.ReactNode;
};

export const Empty: React.FC<EmptyProps> = ({
  title,
  description,
  buttonText,
  onClick,
  icon,
  buttonIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="mb-4 text-muted">
        {icon ?? <FileWarning className="w-12 h-12" />}
      </div>
      <h2 className="text-xl font-semibold mb-2 text-foreground">{title}</h2>
      {description && <p className="text-muted mb-4 max-w-md">{description}</p>}
      {buttonText && (
        <Button
          type="primary"
          onClick={onClick}
          disabled={!onClick}
          icon={buttonIcon}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};
