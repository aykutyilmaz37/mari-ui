"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer } from "@/components/ui/drawer";
import { Input, SearchInput } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/input/OtpInput";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [code, setCode] = useState("");
  const fruits = ["Apple", "Pear", "Orange"];
  const [open, setOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([
    "Apple",
    "Orange",
  ]);

  const allChecked = checkedItems.length === fruits.length;
  const isIndeterminate =
    checkedItems.length > 0 && checkedItems.length < fruits.length;

  const handleItemChange =
    (item: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setCheckedItems((prev) =>
        newChecked ? [...prev, item] : prev.filter((v) => v !== item)
      );
    };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedItems(e.target.checked ? [...fruits] : []);
  };
  return (
    <div className="group focus:border-primary grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header>Header</header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <section>
          <div className="flex gap-1">
            <Button type="primary">Button</Button>
            <Input
              allowClear
              placeholder="+90 (5__) ___ __ __"
              icon={<SearchIcon size={16} />}
              onPressEnter={() => console.log("afsdf")}
              mask="+90 (5__) ___ __ __"
            />
            <Input type="password" visibilityToggle />
          </div>
          <div className="flex flex-col gap-4 items-start p-6">
            <label className="font-semibold text-sm">Doğrulama Kodu</label>
            <OtpInput
              length={6}
              value={code}
              onChange={(val) => setCode(val)}
              onInput={(valArr) => console.log("Her kutu:", valArr)}
              separator="-"
              shape="square"
            />
            <p className="text-muted text-xs">
              Girilen kod: <strong>{code || "..."}</strong>
            </p>
          </div>
          SEarch Input
          <SearchInput onSearch={(e) => console.log(e)} />
          <div>
            <Checkbox
              disabled
              label="Kampanyalardan haberdar olmak istiyorum"
              description="E-posta veya SMS alabilirsiniz"
              size="large"
              variant="solid"
              shape="default"
            />
          </div>
          <div className="flex flex-col gap-2 p-4 max-w-sm">
            <Checkbox
              label="Check all"
              checked={allChecked}
              indeterminate={isIndeterminate}
              onChange={handleCheckAll}
              size="large"
            />
            {fruits.map((item) => (
              <Checkbox
                key={item}
                label={item}
                checked={checkedItems.includes(item)}
                onChange={handleItemChange(item)}
              />
            ))}
          </div>
          <Button onClick={() => setOpen(true)}>Open Drawer</Button>
          <Drawer
            header={<div>Header</div>}
            footer={<div>Footer</div>}
            open={open}
            onClose={() => setOpen(false)}
          >
            <div>Drawer Content</div>
          </Drawer>
        </section>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        Footer
      </footer>
    </div>
  );
}
