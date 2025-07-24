import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Title, Paragraph, Text } from "./Typography";

const meta: Meta = {
  title: "Components/Typography",
  tags: ["autodocs"],
};

export default meta;

// ----------------- Title Story -----------------
export const TitleLevels: StoryObj = {
  render: () => (
    <>
      <Title>h1. Heading</Title>
      <Title level={2}>h2. Heading</Title>
      <Title level={3}>h3. Heading</Title>
      <Title level={4}>h4. Heading</Title>
      <Title level={5}>h5. Heading</Title>
      <Title level={6}>h6. Heading</Title>
    </>
  ),
};

// ----------------- Text Story -----------------
export const TextExample: StoryObj = {
  render: () => (
    <Text>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus amet
      commodi corporis, cumque delectus et exercitationem, illum ipsa iste,
      iusto molestiae necessitatibus odio perferendis quasi quis quod similique
      sunt veritatis.
    </Text>
  ),
};

// ----------------- Paragraph Story -----------------
export const ParagraphExample: StoryObj = {
  render: () => (
    <Paragraph>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus amet
      commodi corporis, cumque delectus et exercitationem, illum ipsa iste,
      iusto molestiae necessitatibus odio perferendis quasi quis quod similique
      sunt veritatis.
    </Paragraph>
  ),
};
