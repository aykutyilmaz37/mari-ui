"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export default function Page() {
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
        </section>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        Footer
      </footer>
    </div>
  );
}
