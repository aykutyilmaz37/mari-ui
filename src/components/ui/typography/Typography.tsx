import React from "react";
import { ParagraphProps, TextProps, TitleProps } from "./types";

export const Text: React.FC<TextProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <span className={className} {...props}>
      {children}
    </span>
  );
};

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p className={className} {...props}>
      {children}
    </p>
  );
};

export const Title: React.FC<TitleProps> = ({
  level = 1,
  children,
  className,
  ...props
}) => {
  const Title = `h${level}` as React.ElementType;
  return (
    <Title className={className} {...props}>
      {children}
    </Title>
  );
};
