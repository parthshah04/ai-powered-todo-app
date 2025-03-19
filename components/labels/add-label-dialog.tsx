"use client";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose, // 1) Import DialogClose
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { Loader } from "lucide-react";

export default function AddLabelDialog() {
  const addLabelMutation = useMutation(api.labels.createALabel);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm();

  // 2) Create a ref to the hidden close button
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const onSubmit = async ({ name }: any) => {
    if (name) {
      setIsLoading(true);
      const labelId: Id<"labels"> | null = await addLabelMutation({ name });

      if (labelId != null) {
        toast({
          title: "😎 Successfully created a Label!",
          duration: 5000,
        });
        setIsLoading(false);

        // 3) Close the dialog after a short delay (e.g. 2 seconds)
        setTimeout(() => {
          closeBtnRef.current?.click();
        }, 1000);
      }
    }
  };

  return (
    <DialogContent className="max-w-xl lg:h-56 flex flex-col md:flex-row lg:justify-between text-right">
      <DialogHeader className="w-full">
        <DialogTitle>Add a Label</DialogTitle>
        <DialogDescription className="capitalize">
          {/* Hidden close button used to programmatically close the dialog */}
          <DialogClose ref={closeBtnRef} className="hidden" />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 border-2 p-6 border-gray-200 my-2 rounded-sm border-foreground/20"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Label name"
                        required
                        className="border-0 font-semibold text-lg"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button disabled={isLoading}>
                {isLoading ? (
                  <div className="flex gap-2">
                    <Loader className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  "Add"
                )}
              </Button>
            </form>
          </Form>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  );
}
