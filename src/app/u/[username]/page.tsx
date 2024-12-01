"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSubmitting(true);
    try {
      const isAcceptingResponse = await axios.post<ApiResponse>(
        "/api/send-message",
        {
          username: params.username,
          content: data.content,
        }
      );
      if (isAcceptingResponse.status !== 200) {
        toast({
          title: isAcceptingResponse?.data.message,
          variant: "destructive",
        });
        return;
      }
      form.setValue("content","")
      toast({
        title: isAcceptingResponse?.data.message,
      });
   
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Unable to send message",
        description:
          axiosError.response?.data?.message ||
          "An error occured. Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div>
        <h1>Public Profile Link</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="content"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>
                      Send Anonymous Message to @{params.username}
                    </FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  {" "}
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending ...
                </>
              ) : (
                "Send it"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default page;
