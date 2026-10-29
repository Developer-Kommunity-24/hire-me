'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recruiterProfileSchema, type RecruiterProfileFormValues } from '../profile-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type RecruiterProfileFormProps = {
  initialValues?: Partial<RecruiterProfileFormValues>
  onSave: (values: RecruiterProfileFormValues) => void
  onCancel?: () => void
}

export default function RecruiterProfileForm({
  initialValues,
  onSave,
  onCancel,
}: RecruiterProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecruiterProfileFormValues>({
    resolver: zodResolver(recruiterProfileSchema),
    defaultValues: {
      companyName: initialValues?.companyName ?? '',
      companyMail: initialValues?.companyMail ?? '',
      companyUrl: initialValues?.companyUrl ?? '',
      headquartersLocation: initialValues?.headquartersLocation ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company name</Label>
        <Input id="companyName" {...register('companyName')} />
        {errors.companyName && (
          <p className="text-sm text-destructive">{errors.companyName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyMail">Company email</Label>
        <Input id="companyMail" type="email" {...register('companyMail')} />
        {errors.companyMail && (
          <p className="text-sm text-destructive">{errors.companyMail.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyUrl">Company website (optional)</Label>
        <Input id="companyUrl" placeholder="https://example.com" {...register('companyUrl')} />
        {errors.companyUrl && (
          <p className="text-sm text-destructive">{errors.companyUrl.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="headquartersLocation">Headquarters location</Label>
        <Input id="headquartersLocation" {...register('headquartersLocation')} />
        {errors.headquartersLocation && (
          <p className="text-sm text-destructive">{errors.headquartersLocation.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          Save Profile
        </Button>
      </div>
    </form>
  )
}
