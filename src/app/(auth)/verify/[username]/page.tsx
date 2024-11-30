"use client"
import { Button } from '@/components/ui/button';
import { Form,FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { verifyScheam } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import {  useForm } from 'react-hook-form';
import { z } from 'zod';

const page = () => {
    const router=useRouter();
    const params=useParams<{username:string}>();
    const {toast}=useToast()

    const form=useForm<z.infer<typeof verifyScheam>>({
        resolver:zodResolver(verifyScheam),
        defaultValues: {
            verifyCode: ''
        }
    })

    const onSubmit=async(data: z.infer<typeof verifyScheam>)=>{
        try {
            const response=await axios.post<ApiResponse>(`/api/verify-code`,{
                username:params.username,
                code:data.verifyCode
            })
            if(response.status===200){
                toast({
                    title:'Success',
                    description:response.data.message,
                   
                })
                router.replace('/sign-in')
            }
            
        } catch (error) {
            const axiosError=error as AxiosError<ApiResponse>;
            toast({
                title:'Verfication Failed',
                description:axiosError?.response?.data?.message ?? 'An error occured. Please try again later',
                variant:'destructive'
            })
        }

    }



  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl mb-6">
          Verify Your Account
        </h1>
        <p className="mb-4">Enter the verification code sent to your email</p>
      </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
            name='verifyCode'
            control={form.control}
            render={({field})=>{
                return(
                    <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <Input {...field}/>
                        <FormMessage/>
                    </FormItem>
                )
            }}
            
            />
            <Button type='submit'>Verify</Button>
            </form>
        </Form>


      </div>
    </div>
  )
}

export default page