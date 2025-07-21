import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Typography from './Typography';

const meta: Meta<typeof Typography> = {
	title: 'Components/Typography',
	component: Typography,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
	render: () => (
		<>
			<Typography.Title>h1. Heading</Typography.Title>
			<Typography.Title level={2}>h2. Heading</Typography.Title>
			<Typography.Title level={3}>h3. Heading</Typography.Title>
			<Typography.Title level={4}>h4. Heading</Typography.Title>
			<Typography.Title level={5}>h5. Heading</Typography.Title>
			<Typography.Title level={6}>h6. Heading</Typography.Title>
			<Typography.Text>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus amet commodi corporis, cumque delectus et
				exercitationem, illum ipsa iste, iusto molestiae necessitatibus odio perferendis quasi quis quod similique sunt
				veritatis.
			</Typography.Text>
			<Typography.Paragraph>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus amet commodi corporis, cumque delectus et
				exercitationem, illum ipsa iste, iusto molestiae necessitatibus odio perferendis quasi quis quod similique sunt
				veritatis.
			</Typography.Paragraph>
		</>
	),
};
