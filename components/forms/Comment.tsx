"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { usePathname, useRouter } from "next/navigation";
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { addCommentToThread } from "@/lib/actions/thread.actions";
// import { createThread } from "@/lib/actions/thread.actions";

interface Props {
  threadId: string;
  userImage: string;
  currentUserId: string;
}

const Comment = ({ threadId, userImage, currentUserId }: Props) => {
  const [disabledBtn, setDisabledBtn] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const form = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });
  function handleInputChange(e: any) {
    if (e.target.value.length > 0) {
      setDisabledBtn(false);
    } else {
      setDisabledBtn(true);
    }
  }
  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    const commentThread = await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname
    );
    form.reset();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 w-full">
              <FormLabel>
                <Image
                  src={userImage}
                  alt="profile image"
                  width={48}
                  height={48}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    height: "48px",
                    width: "48px",
                  }}
                />
              </FormLabel>
              <FormControl className="bg-transparent border-none">
                <Input
                  type="text"
                  placeholder="Comment..."
                  className="text-light-1 outline-none no-focus"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange(e);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          disabled={disabledBtn}
          type="submit"
          className="comment-form_btn"
        >
          Reply
        </Button>
      </form>
    </Form>
  );
};
export default Comment;
