"use client";

import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <div>
      <Pagination
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={10}
        totalItems={500}
      />
    </div>
  );
}
