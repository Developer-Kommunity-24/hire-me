'use client'

import { Plus, Trash2, X } from 'lucide-react'
import {
  useFieldArray,
  useFormContext,
  useWatch,
  type Control,
  type FieldValues,
} from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDuration } from '../utils'
import type { Experience, ExperienceEditSectionProps, FullProfileState } from '../types'

interface ExperienceItemEditorProps {
  index: number
  itemErrors?: Partial<Record<keyof Experience, string>>
  onDelete: (index: number) => void
}

function ExperienceItemEditor({ index, itemErrors, onDelete }: ExperienceItemEditorProps) {
  const { control, register, setValue, getValues } = useFormContext<FullProfileState>()

  const title = useWatch({ control, name: `experiences.${index}.title` })

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray<FieldValues>({
    control: control as unknown as Control<FieldValues>,
    name: `experiences.${index}.achievements`,
  })

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const end = getValues(`experiences.${index}.endDate`)
    setValue(`experiences.${index}.duration`, formatDuration(e.target.value, end), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = getValues(`experiences.${index}.startDate`)
    setValue(`experiences.${index}.duration`, formatDuration(start, e.target.value), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-bg-page border border-border-subtle transition-all duration-200 hover:border-border-muted hover:shadow-xs">
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-border-subtle">
        <span className="text-xs font-bold text-brand-dark bg-brand-light px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-brand-mint/50">
          Experience #{index + 1}
        </span>

        <Button
          onClick={() => onDelete(index)}
          variant="destructive"
          size="xs"
          aria-label={`Delete experience ${title || index + 1}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`exp-title-${index}`}
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Position / Role <span className="text-red-500">*</span>
          </label>
          <Input
            id={`exp-title-${index}`}
            type="text"
            required
            {...register(`experiences.${index}.title`)}
            placeholder="e.g. Software Engineering Intern"
            aria-invalid={Boolean(itemErrors?.title)}
          />
          {itemErrors?.title && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {itemErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`exp-company-${index}`}
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Company <span className="text-red-500">*</span>
          </label>
          <Input
            id={`exp-company-${index}`}
            type="text"
            required
            {...register(`experiences.${index}.company`)}
            placeholder="e.g. Google"
            aria-invalid={Boolean(itemErrors?.company)}
          />
          {itemErrors?.company && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {itemErrors.company}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`exp-location-${index}`}
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Location
          </label>
          <Input
            id={`exp-location-${index}`}
            type="text"
            {...register(`experiences.${index}.location`)}
            placeholder="e.g. Mountain View, CA or Remote"
          />
        </div>

        <div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor={`exp-start-${index}`}
                className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
              >
                Start Date
              </label>
              <Input
                id={`exp-start-${index}`}
                type="text"
                {...register(`experiences.${index}.startDate`, {
                  onChange: handleStartDateChange,
                })}
                placeholder="e.g. JUN 2023"
              />
            </div>

            <div>
              <label
                htmlFor={`exp-end-${index}`}
                className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
              >
                End Date
              </label>
              <Input
                id={`exp-end-${index}`}
                type="text"
                {...register(`experiences.${index}.endDate`, {
                  onChange: handleEndDateChange,
                })}
                placeholder="e.g. AUG 2023 or Present"
                aria-invalid={Boolean(itemErrors?.endDate)}
              />
            </div>
          </div>
          {itemErrors?.endDate && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {itemErrors.endDate}
            </p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-2 mt-1">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
            Description & Achievements (Bullet Points)
          </label>

          {achievementFields.map((achField, aIdx) => (
            <div key={achField.id} className="flex items-center gap-2">
              <span className="text-text-muted/60 text-sm font-bold select-none">•</span>
              <Input
                type="text"
                {...register(`experiences.${index}.achievements.${aIdx}`)}
                placeholder="e.g. Developed scalable microservices in Go, improving latency by 25%..."
                className="flex-1 py-1.5"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAchievement(aIdx)}
                className="h-8 w-8 p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg"
                title="Remove bullet point"
                aria-label={`Remove achievement bullet ${aIdx + 1}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => appendAchievement('')}
            className="gap-1 p-0 h-auto font-semibold text-brand-dark hover:text-brand hover:bg-transparent"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Bullet Point
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ExperienceEditSection({
  control: controlProp,
  experiences: experiencesProp,
  onChange,
  errors,
}: ExperienceEditSectionProps) {
  const formContext = useFormContext<FullProfileState>()
  const control = controlProp ?? formContext?.control

  const fieldArray = useFieldArray({
    control,
    name: 'experiences',
  })

  const isFieldArrayActive = Boolean(control)
  const fields = isFieldArrayActive ? fieldArray.fields : experiencesProp || []

  const handleAddExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      title: '',
      company: '',
      location: '',
      duration: '',
      startDate: '',
      endDate: '',
      achievements: [''],
    }
    if (isFieldArrayActive) {
      fieldArray.append(newExp)
    } else if (onChange && experiencesProp) {
      onChange([...experiencesProp, newExp])
    }
  }

  const handleDeleteExperience = (index: number) => {
    if (isFieldArrayActive) {
      fieldArray.remove(index)
    } else if (onChange && experiencesProp) {
      onChange(experiencesProp.filter((_, idx) => idx !== index))
    }
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main">Work Experience</h2>
          <p className="text-xs text-text-muted mt-1">
            Showcase your internships, full-time roles, or part-time work with key achievements.
          </p>
        </div>
        <Button onClick={handleAddExperience} size="sm" className="shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Add Experience
        </Button>
      </div>

      <div className="space-y-6">
        {fields.length === 0 ? (
          <div className="text-center py-8 bg-bg-page rounded-2xl border border-dashed border-border-muted">
            <p className="text-sm text-text-muted mb-3">No work experience added yet.</p>
            <Button onClick={handleAddExperience} variant="secondary" size="xs">
              <Plus className="w-3.5 h-3.5" />
              Add First Experience
            </Button>
          </div>
        ) : (
          fields.map((field, idx) => (
            <ExperienceItemEditor
              key={field.id || idx}
              index={idx}
              itemErrors={errors?.[idx]}
              onDelete={handleDeleteExperience}
            />
          ))
        )}
      </div>
    </Card>
  )
}
