import React from 'react';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
	children?: React.ReactNode;
	className?: string;
}

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
	children?: React.ReactNode;
	className?: string;
}

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children?: React.ReactNode;
	className?: string;
}
