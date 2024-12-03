'use client'

import { useState } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios, { AxiosError } from "axios"
import { Loader2, MessageSquare, Send, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { messageSchema } from "@/schemas/messageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import Footer from "@/components/Footer"


export default function SendMessage() {
  const [suggestions, setSuggestions] = useState<string[]>([
    "What's the best place you've ever visited outside your home country?",
    "Can you describe your favorite hobby and how it brings you joy?",
    "What's the most challenging project you've ever undertaken and how did you overcome it?"
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false)
  const params = useParams<{ username: string }>()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  })

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue('content', suggestion)
  }

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username: params.username,
        content: data.content,
      })
      form.reset()
      toast({
        title: response.data.message,
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: "Unable to send message",
        description: axiosError.response?.data?.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSuggestions = async () => {
    setFetchingSuggestions(true)
    try {
      const response = await axios.get<ApiResponse>('/api/suggest-messages')
      const receivedSuggestions: string[] = response?.data.message.split("||")
      setSuggestions(receivedSuggestions)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: 'Unable to get suggestions',
        description: axiosError?.response?.data?.message ?? 'An error occurred. Please try again later'
      })
    } finally {
      setFetchingSuggestions(false)
    }
  }

  return (
    <div className="min-h-screen hero-pattern flex flex-col justify-between px-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-card w-full max-w-2xl p-8 rounded-xl space-y-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Send Anonymous Message</h1>
            <p className="text-sm text-muted-foreground">
              to @{params.username}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                name="content"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Message</FormLabel>
                    <Input
                      {...field}
                      className="bg-background/50"
                      placeholder="Type your anonymous message..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={getSuggestions}
                  disabled={fetchingSuggestions}
                >
                  {fetchingSuggestions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Ideas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get Message Ideas
                    </>
                  )}
                </Button>
                
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground text-center">
                      Click on any suggestion to use it
                    </p>
                    <div className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="p-3 rounded-lg bg-background/50 hover:bg-background/80 cursor-pointer transition-colors text-sm border border-border/50"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
