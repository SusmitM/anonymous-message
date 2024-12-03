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
import { toast, useToast } from "@/hooks/use-toast";
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
  const[suggestions,setSuggestions]=useState<string[]>(["What's the best place you've ever visited outside your home country?",
    "Can you describe your favorite hobby and how it brings you joy?","What's the most challenging project you've ever undertaken and how did you overcome it?"
  ])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingSuggestions,setFetchingSuggestions]=useState(false);
  const params = useParams<{ username: string }>();

  const {toast}=useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });
  const{setValue,handleSubmit}=form;

  const handleSuggestionClick=(suggestion:string)=>{
      setValue('content',suggestion)
  }

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
  const getSuggestions=async()=>{
    setFetchingSuggestions(true)
    try {
      const response=await axios.get<ApiResponse>('/api/suggest-messages');
      const receivedSuggestions:string[]=response?.data.message.split("||");

      setSuggestions(receivedSuggestions)
    
      
    } catch (error) {
      const axiosError=error as AxiosError<ApiResponse>;
      

      toast({
        title:'Unable to get suggestions',
        description:axiosError?.response?.data?.message ?? 'An error occured. Please try again later'
      })
    }
    finally{
      setFetchingSuggestions(false);
    }
  }

  return (
    <>
      <div>
        <h1>Public Profile Link</h1>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
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
        <Button disabled={fetchingSuggestions} onClick={getSuggestions}>
        {fetchingSuggestions ? (
                <>
                  {" "}
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching ...
                </>
              ) : (
                "Suggest Messages"
              )}
        </Button>
        <p>Click on any suggestion below to select it.</p>
        <div>
          {
            suggestions.map((suggestion,index)=>{
              return(
                <div key={index} onClick={()=>handleSuggestionClick(suggestion)} >
                {suggestion}
                </div>
              )
            })
          }
        </div>
      </div>
    </>
  );
};

export default page;
