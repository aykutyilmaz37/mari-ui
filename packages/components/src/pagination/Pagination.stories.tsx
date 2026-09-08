import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Sayfalanmış bir veri kümesinde gezinme kontrolü. Tamamen controlled — `currentPage` ve `onPageChange` " +
          "zorunludur, dahili state tutmaz. Hook kullanmaz, sunucu bileşeni olarak render edilebilir.",
      },
    },
  },
  argTypes: {
    currentPage: { control: "number", description: "Aktif sayfa (1 tabanlı)." },
    pageSize: { control: "number", description: "Sayfa başına öğe sayısı." },
    totalItems: { control: "number", description: "Toplam öğe sayısı — toplam sayfa buradan hesaplanır." },
    onPageChange: { description: "Bir sayfa numarasına tıklandığında çağrılır." },
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

/** Gerçek etkileşimi göstermek için `currentPage`'i kendi state'inde tutan bir sarmalayıcı. */
function InteractivePagination(props: { totalItems: number; pageSize: number; initialPage?: number }) {
  const [page, setPage] = useState(props.initialPage ?? 1);
  return <Pagination currentPage={page} pageSize={props.pageSize} totalItems={props.totalItems} onPageChange={setPage} />;
}

export const Playground: Story = {
  render: () => <InteractivePagination totalItems={95} pageSize={10} />,
};

export const MiddlePage: Story = {
  name: "Orta Sayfa",
  render: () => <InteractivePagination totalItems={95} pageSize={10} initialPage={5} />,
};

export const LastPage: Story = {
  name: "Son Sayfa",
  render: () => <InteractivePagination totalItems={95} pageSize={10} initialPage={10} />,
};

export const FewPages: Story = {
  name: "Az Sayfa (Ellipsis Yok)",
  render: () => <InteractivePagination totalItems={40} pageSize={10} />,
};
