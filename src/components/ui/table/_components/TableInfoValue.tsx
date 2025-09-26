import { Tooltip } from "../../tooltip";

type TableInfoValueProps = {
  info?: boolean;
  value: string;
};

export const TableInfoValue: React.FC<TableInfoValueProps> = ({
  info,
  value,
}) => {
  return info ? (
    <Tooltip
      className="w-2xs"
      placement="bottom"
      trigger={
        <span className="truncate text-pretty line-clamp-3">{value}</span>
      }
      content={<span>{value}</span>}
    />
  ) : (
    <span className="truncate text-pretty line-clamp-3">{value}</span>
  );
};
