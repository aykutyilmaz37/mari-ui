import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";
import { DropdownTrigger } from "./_components/DropdownTrigger";
import { DropdownContent } from "./_components/DropdownContent";

/**
 * Not: bu story dosyası eskiden gerçek API ile uyuşmuyordu (`trigger`/
 * `placement`'ı doğrudan `Dropdown`a prop olarak geçiriyordu, ama gerçek
 * API compound-component deseni: `<Dropdown><DropdownTrigger/>
 * <DropdownContent/></Dropdown>`). Düzeltildi.
 */
const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Bottom: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger color="primary" variant="solid">
        Menüyü Aç
      </DropdownTrigger>
      <DropdownContent placement="bottom">
        <div className="w-40">Dropdown İçeriği</div>
      </DropdownContent>
    </Dropdown>
  ),
};

export const Top: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger color="primary" variant="solid">
        Menüyü Aç
      </DropdownTrigger>
      <DropdownContent placement="top">
        <div className="w-40">Dropdown İçeriği</div>
      </DropdownContent>
    </Dropdown>
  ),
};

export const Plain: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>Renksiz Trigger</DropdownTrigger>
      <DropdownContent placement="bottom">
        <div className="w-40">Dropdown İçeriği</div>
      </DropdownContent>
    </Dropdown>
  ),
};

export const Hoverable: Story = {
  render: () => (
    <Dropdown hover>
      <DropdownTrigger color="neutral" variant="soft">
        Üzerine Gel
      </DropdownTrigger>
      <DropdownContent placement="bottom">
        <div className="w-40">Hover ile açılan içerik</div>
      </DropdownContent>
    </Dropdown>
  ),
};
