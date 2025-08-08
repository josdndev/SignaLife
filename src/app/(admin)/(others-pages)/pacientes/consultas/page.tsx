import { Metadata } from "next";
import Camas from "@/components/uiBasic/Camas";

export const metadata: Metadata = {
  title: "Next.js Calender | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calender page for TailAdmin Tailwind CSS Admin Dashboard Template",
};

export default function Page() {
  return (
    <div>
      <Camas />
    </div>
  );
}
