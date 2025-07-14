import { PositionType } from "./types";

export const getPositionInClass = (position: PositionType) => {
  return {
    top: "top-4 left-1/2 -translate-x-1/2 translate-y-0 opacity-100",
    bottom: "bottom-4 left-1/2 -translate-x-1/2 -translate-y-4 opacity-100",
    topRight: "top-4 right-4 translate-x-0 opacity-100 ",
    topLeft: "top-4 left-4 translate-x-0 opacity-100 ",
    bottomLeft: "bottom-4 left-4 translate-x-0 opacity-100",
    bottomRight: "bottom-4 right-4 translate-x-0 opacity-100",
  }[position];
};
export const getPositionOutClass = (position: PositionType) => {
  return {
    top: "top-4 left-1/2 -translate-x-1/2 -translate-y-96 opacity-0",
    bottom: "bottom-4 left-1/2 -translate-x-1/2 translate-y-0 opacity-0",
    topRight: "top-4 right-4 translate-x-96 opacity-0 ",
    topLeft: "top-4 left-4 -translate-x-96 opacity-100 ",
    bottomLeft: "bottom-4 left-4 -translate-x-96 opacity-0",
    bottomRight: "bottom-4 right-4 translate-x-96 opacity-0",
  }[position];
};
