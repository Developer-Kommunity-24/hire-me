'use client'

import { useState, type KeyboardEvent } from 'react'
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
import { cn } from '@/lib/utils'
import type { Project, ProjectsEditSectionProps, FullProfileState } from '../types'

interface ProjectCardEditorProps {
  index: number
  onDelete: (index: number) => void
  errors?: Partial<Record<keyof Project, string>>
}

function ProjectCardEditor({ index, onDelete, errors }: ProjectCardEditorProps) {
  const { control, register } = useFormContext<FullProfileState>()
  const [newTag, setNewTag] = useState('')

  const title = useWatch({ control, name: `projects.${index}.title` })

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray<FieldValues>({
    control: control as unknown as Control<FieldValues>,
    name: `projects.${index}.tags`,
  })

  const currentTags = useWatch({ control, name: `projects.${index}.tags` }) || []

  const handleAddTag = () => {
    const trimmed = newTag.trim().toUpperCase()
    if (!trimmed) return
    if (currentTags.includes(trimmed)) {
      setNewTag('')
      return
    }

    appendTag(trimmed)
    setNewTag('')
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tagIndex: number) => {
    removeTag(tagIndex)
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-bg-page border border-border-subtle transition-all duration-200 hover:border-border-muted hover:shadow-xs">
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-border-subtle">
        <span className="text-xs font-bold text-brand-dark bg-brand-light px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-brand-mint/50">
          Project #{index + 1}
        </span>

        <Button
          onClick={() => onDelete(index)}
          variant="destructive"
          size="xs"
          aria-label={`Delete project ${title || index + 1}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor={`proj-title-${index}`}
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Project Title <span className="text-red-500">*</span>
          </label>
          <Input
            id={`proj-title-${index}`}
            type="text"
            required
            {...register(`projects.${index}.title`)}
            placeholder="e.g. Distributed Cache System"
            aria-invalid={Boolean(errors?.title)}
          />
          {errors?.title && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`proj-desc-${index}`}
            className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`proj-desc-${index}`}
            rows={3}
            required
            {...register(`projects.${index}.description`)}
            placeholder="Describe the architecture, problem solved, impact, and engineering techniques used..."
            aria-invalid={Boolean(errors?.description)}
            className={cn(
              'flex min-h-[80px] w-full rounded-xl border border-border-subtle bg-card px-3.5 py-2 text-sm text-text-main shadow-xs placeholder:text-text-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus-visible:ring-red-500 resize-y',
            )}
          />
          {errors?.description && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={`proj-start-${index}`}
              className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
            >
              Start Date
            </label>
            <Input
              id={`proj-start-${index}`}
              type="text"
              {...register(`projects.${index}.startDate`)}
              placeholder="e.g. SEP 2023"
            />
          </div>

          <div>
            <label
              htmlFor={`proj-end-${index}`}
              className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5"
            >
              End Date
            </label>
            <Input
              id={`proj-end-${index}`}
              type="text"
              {...register(`projects.${index}.endDate`)}
              placeholder="e.g. DEC 2023 or Present"
              aria-invalid={Boolean(errors?.endDate)}
            />
          </div>
        </div>
        {errors?.endDate && (
          <p className="mt-1 text-xs text-red-500 font-medium" role="alert">
            {errors.endDate}
          </p>
        )}

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
            Technologies & Tags
          </label>

          <div className="flex flex-wrap gap-2 mb-2 min-h-[30px] items-center">
            {tagFields.length === 0 ? (
              <span className="text-xs text-text-muted/60 italic">No tags added yet.</span>
            ) : (
              tagFields.map((tagField, tIdx) => {
                const tag = currentTags[tIdx] ?? ''
                return (
                  <span
                    key={tagField.id}
                    className="inline-flex items-center gap-1.5 bg-card text-text-main text-xs font-mono px-2.5 py-1 rounded-lg border border-border-subtle shadow-xs"
                  >
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTag(tIdx)}
                      className="h-4 w-4 p-0.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded"
                      title="Remove tag"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </span>
                )
              })
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tech tag (e.g. REACT, PYTHON)..."
              className="flex-1 uppercase font-mono text-xs"
            />
            <Button onClick={handleAddTag} disabled={!newTag.trim()} size="sm">
              <Plus className="w-3.5 h-3.5" />
              Add Tag
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsEditSection({
  control: controlProp,
  projects: projectsProp,
  onChange,
  errors,
}: ProjectsEditSectionProps) {
  const formContext = useFormContext<FullProfileState>()
  const control = controlProp ?? formContext?.control

  const fieldArray = useFieldArray({
    control,
    name: 'projects',
  })

  const isFieldArrayActive = Boolean(control)
  const fields = isFieldArrayActive ? fieldArray.fields : projectsProp || []

  const handleAddProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: '',
      description: '',
      tags: [],
      startDate: '',
      endDate: '',
    }
    if (isFieldArrayActive) {
      fieldArray.append(newProj)
    } else if (onChange && projectsProp) {
      onChange([...projectsProp, newProj])
    }
  }

  const handleDeleteProject = (index: number) => {
    if (isFieldArrayActive) {
      fieldArray.remove(index)
    } else if (onChange && projectsProp) {
      onChange(projectsProp.filter((_, idx) => idx !== index))
    }
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main">Featured Projects</h2>
          <p className="text-xs text-text-muted mt-1">
            Highlight your top software projects, architectures, and technical accomplishments.
          </p>
        </div>
        <Button onClick={handleAddProject} size="sm" className="shrink-0">
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </Button>
      </div>

      <div className="space-y-6">
        {fields.length === 0 ? (
          <div className="text-center py-8 bg-bg-page rounded-2xl border border-dashed border-border-muted">
            <p className="text-sm text-text-muted mb-3">No projects added yet.</p>
            <Button onClick={handleAddProject} variant="secondary" size="xs">
              <Plus className="w-3.5 h-3.5" />
              Add First Project
            </Button>
          </div>
        ) : (
          fields.map((field, idx) => (
            <ProjectCardEditor
              key={field.id || idx}
              index={idx}
              onDelete={handleDeleteProject}
              errors={errors?.[idx]}
            />
          ))
        )}
      </div>
    </Card>
  )
}
