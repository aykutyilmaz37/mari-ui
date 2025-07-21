import React from 'react';
import { ParagraphProps, TextProps, TitleProps } from './types';

const Text: React.FC<TextProps> = ({ children, className, ...props }) => {
	return (
		<span className={className} {...props}>
			{children}
		</span>
	);
};

const Paragraph: React.FC<ParagraphProps> = ({ children, className, ...props }) => {
	return (
		<p className={className} {...props}>
			{children}
		</p>
	);
};

const Title: React.FC<TitleProps> = ({ level = 1, children, className, ...props }) => {
	const Title = `h${level}` as React.ElementType;
	return (
		<Title className={className} {...props}>
			{children}
		</Title>
	);
};

type TypographyComponent = React.FC<{ children?: React.ReactNode }> & {
	Text: React.FC<TextProps>;
	Paragraph: React.FC<ParagraphProps>;
	Title: React.FC<TitleProps>;
};

const Typography: TypographyComponent = ({ children }) => {
	return <>{children}</>;
};

Typography.Text = Text;
Typography.Paragraph = Paragraph;
Typography.Title = Title;

export default Typography;