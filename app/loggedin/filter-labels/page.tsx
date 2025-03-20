"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SideBar from "@/components/nav/side-bar";
import MobileNav from "@/components/nav/mobile-nav";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddLabelDialog from "@/components/labels/add-label-dialog";
import { Plus, Tag } from "lucide-react";

interface Label {
  _id: string;
  name: string;
}

export default function FilterLabelsPage() {
  // 1. Fetch labels from Convex
  const labels = useQuery(api.labels.getLabels) || [];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SideBar />
      <div className="flex flex-col">
        <MobileNav />

        <main className="flex-1 p-4 lg:px-8 flex flex-col gap-6">
          {/* Top Row: "Filters & Labels" + Plus Icon next to it */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Filters &amp; Labels</h1>

            {/* Dialog for adding a label via the "+" icon */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="rounded-full p-2 bg-orange-100 text-orange-600 hover:bg-orange-200 transition"
                  title="Add a new label"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </DialogTrigger>
              <AddLabelDialog />
            </Dialog>
          </div>

          {/* White Card Container for Label List */}

          
          <div className="bg-white border border-foreground/20 shadow-sm rounded-md p-4">
            {labels.length === 0 ? (
              <p className="text-sm text-gray-500">No labels found.</p>
            ) : (
              <ul className="space-y-2">
                {labels.map((label: Label) => (
                  <li
                    key={label._id}
                    className="border-b last:border-b-0 border-gray-200 py-2"
                  >
                    <div className="flex items-center space-x-2">
                      {/* Tag icon with a new size and color */}
                      <Tag className="h-5 w-5 text-orange-600" />

                      {/* Pill-styled label name */}
                      <span className="inline-block px-4 py-1 text-sm font-medium rounded-full ">
                        {label.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}