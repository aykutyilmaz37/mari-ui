import { UploadIcon } from "lucide-react";
import { Button } from "../../button";

type UploadListButtonProps = {
  handleClick: () => void;
};
export const UploadListButton: React.FC<UploadListButtonProps> = ({
  handleClick,
}) => {
  return (
    <Button
      onClick={handleClick}
      className="flex justify-between items-center"
      variant="outlined"
      type="primary"
      icon={<UploadIcon size={16} />}
    >
      Click to Upload
    </Button>
  );
};
