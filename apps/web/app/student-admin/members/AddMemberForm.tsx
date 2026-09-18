'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { createMember, membersQueryKey } from './members-data'

// ---- Schema ----
export const memberSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  usn: z
    .string()
    .trim()
    .min(3, 'USN must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
    .transform((value) => value.toUpperCase()),
  email: z.string().trim().email('Enter a valid email address'),
})

export type MemberFormValues = z.infer<typeof memberSchema>

export default function AddMembers() {
  const queryClient = useQueryClient()

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: '',
      usn: '',
      email: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: MemberFormValues) =>
      createMember({ name: values.fullName, usn: values.usn, email: values.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersQueryKey })
      form.reset()
    },
  })

  function onSubmit(values: MemberFormValues) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 p-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="usn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>USN</FormLabel>
              <FormControl>
                <Input placeholder="USN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mutation.isError && (
          <p className="text-sm text-red-500">
            {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
          </p>
        )}

        <Button type="submit" disabled={mutation.isPending} className="self-start">
          {mutation.isPending ? 'Adding...' : 'Add Member'}
        </Button>
      </form>
    </Form>
  )
}
