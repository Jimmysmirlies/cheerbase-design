"use client";

import * as React from "react";

import { Button } from "@workspace/ui/shadcn/button";

type PrintInvoiceButtonProps = {
  children?: React.ReactNode;
};

export function PrintInvoiceButton({
  children = "Print invoice",
}: PrintInvoiceButtonProps) {
  return (
    <Button type="button" variant="outline" onClick={() => window.print()}>
      {children}
    </Button>
  );
}
