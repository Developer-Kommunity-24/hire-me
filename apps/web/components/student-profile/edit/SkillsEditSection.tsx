'use client'

import { useState, type KeyboardEvent } from 'react'
import { Check, Pencil, X, Plus } from 'lucide-react'
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
import { getCategoryIcon } from '../utils'
import type { SkillCategory, SkillsEditSectionProps, FullProfileState } from '../types'

interface SkillCategoryEditorProps {
  category: SkillCategory
  categoryIndex: number
  onUpdateCategory?: (index: number, updated: SkillCategory) => void
}

function SkillCategoryEditor({
  category,
  categoryIndex,
  onUpdateCategory,
}: SkillCategoryEditorProps) {
  const formContext = useFormContext<FullProfileState>()
  const control = formContext?.control
  const setValue = formContext?.setValue

  const [newSkillText, setNewSkillText] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray<FieldValues>({
    control: control as unknown as Control<FieldValues>,
    name: `skills.${categoryIndex}.skills`,
  })

  const watchedSkills = useWatch({
    control,
    name: `skills.${categoryIndex}.skills` as const,
  })

  const isFieldArrayActive = Boolean(control)
  const currentSkills = isFieldArrayActive ? watchedSkills || [] : category.skills

  const handleAddSkill = () => {
    const trimmed = newSkillText.trim()
    if (!trimmed) return
    if (currentSkills.some((s: string) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillText('')
      return
    }

    if (isFieldArrayActive) {
      appendSkill(trimmed)
    } else if (onUpdateCategory) {
      onUpdateCategory(categoryIndex, {
        ...category,
        skills: [...category.skills, trimmed],
      })
    }
    setNewSkillText('')
  }

  const handleAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleRemoveSkill = (skillIndex: number) => {
    if (isFieldArrayActive) {
      removeSkill(skillIndex)
    } else if (onUpdateCategory) {
      onUpdateCategory(categoryIndex, {
        ...category,
        skills: category.skills.filter((_, idx) => idx !== skillIndex),
      })
    }
  }

  const handleStartEdit = (index: number, currentValue: string) => {
    setEditingIndex(index)
    setEditingValue(currentValue)
  }

  const handleSaveEdit = (skillIndex: number) => {
    const trimmed = editingValue.trim()
    if (!trimmed) {
      handleRemoveSkill(skillIndex)
    } else if (isFieldArrayActive && setValue) {
      setValue(`skills.${categoryIndex}.skills.${skillIndex}`, trimmed, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } else if (onUpdateCategory) {
      const updatedSkills = [...category.skills]
      updatedSkills[skillIndex] = trimmed
      onUpdateCategory(categoryIndex, { ...category, skills: updatedSkills })
    }
    setEditingIndex(null)
    setEditingValue('')
  }

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, skillIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit(skillIndex)
    } else if (e.key === 'Escape') {
      setEditingIndex(null)
      setEditingValue('')
    }
  }

  const CategoryIcon = getCategoryIcon(category.label)
  const skillCount = isFieldArrayActive ? skillFields.length : category.skills.length

  return (
    <div className="p-5 rounded-2xl bg-bg-page border border-border-subtle hover:border-border-muted transition-all duration-200 space-y-3.5">
      <div className="flex items-center gap-2">
        <CategoryIcon className="w-4 h-4 text-brand-dark" />
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {category.label}
        </h3>
        <span className="text-xs text-text-muted/60 font-mono">({skillCount})</span>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[36px] items-center">
        {skillCount === 0 ? (
          <span className="text-xs text-text-muted/60 italic">
            No skills added yet in this category.
          </span>
        ) : isFieldArrayActive ? (
          skillFields.map((skillField, sIdx) => {
            const skill = currentSkills[sIdx] ?? ''
            const isEditing = editingIndex === sIdx

            if (isEditing) {
              return (
                <div
                  key={skillField.id}
                  className="inline-flex items-center gap-1 bg-card border-2 border-brand rounded-lg px-1.5 py-0.5 shadow-xs"
                >
                  <Input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, sIdx)}
                    onBlur={() => handleSaveEdit(sIdx)}
                    autoFocus
                    className="h-auto border-0 bg-transparent p-0 px-1 text-xs font-mono shadow-none focus-visible:ring-0 rounded-none w-24"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSaveEdit(sIdx)
                    }}
                    className="h-6 w-6 p-1 text-brand-dark hover:text-brand hover:bg-brand-light rounded-lg"
                    title="Save skill"
                    aria-label={`Save ${skill}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )
            }

            return (
              <div
                key={skillField.id}
                className="group inline-flex items-center gap-1.5 bg-card text-text-main text-xs font-mono px-2.5 py-1 rounded-lg border border-border-subtle shadow-xs hover:border-border-muted transition-all"
              >
                <span>{skill}</span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStartEdit(sIdx, skill)}
                  className="h-5 w-5 p-0.5 opacity-60 hover:opacity-100 text-text-muted hover:text-brand-dark hover:bg-bg-page rounded"
                  title="Edit skill"
                  aria-label={`Edit ${skill}`}
                >
                  <Pencil className="w-3 h-3" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSkill(sIdx)}
                  className="h-5 w-5 p-0.5 opacity-60 hover:opacity-100 text-text-muted hover:text-red-500 hover:bg-red-50 rounded"
                  title="Remove skill"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )
          })
        ) : (
          category.skills.map((skill, sIdx) => {
            const isEditing = editingIndex === sIdx

            if (isEditing) {
              return (
                <div
                  key={sIdx}
                  className="inline-flex items-center gap-1 bg-card border-2 border-brand rounded-lg px-1.5 py-0.5 shadow-xs"
                >
                  <Input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, sIdx)}
                    onBlur={() => handleSaveEdit(sIdx)}
                    autoFocus
                    className="h-auto border-0 bg-transparent p-0 px-1 text-xs font-mono shadow-none focus-visible:ring-0 rounded-none w-24"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSaveEdit(sIdx)
                    }}
                    className="h-6 w-6 p-1 text-brand-dark hover:text-brand hover:bg-brand-light rounded-lg"
                    title="Save skill"
                    aria-label={`Save ${skill}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )
            }

            return (
              <div
                key={sIdx}
                className="group inline-flex items-center gap-1.5 bg-card text-text-main text-xs font-mono px-2.5 py-1 rounded-lg border border-border-subtle shadow-xs hover:border-border-muted transition-all"
              >
                <span>{skill}</span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStartEdit(sIdx, skill)}
                  className="h-5 w-5 p-0.5 opacity-60 hover:opacity-100 text-text-muted hover:text-brand-dark hover:bg-bg-page rounded"
                  title="Edit skill"
                  aria-label={`Edit ${skill}`}
                >
                  <Pencil className="w-3 h-3" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSkill(sIdx)}
                  className="h-5 w-5 p-0.5 opacity-60 hover:opacity-100 text-text-muted hover:text-red-500 hover:bg-red-50 rounded"
                  title="Remove skill"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )
          })
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <Input
            type="text"
            value={newSkillText}
            onChange={(e) => setNewSkillText(e.target.value)}
            onKeyDown={handleAddKeyDown}
            placeholder={`Add a skill to ${category.label.toLowerCase()} (e.g. Next.js)...`}
            className="text-xs"
          />
        </div>
        <Button onClick={handleAddSkill} disabled={!newSkillText.trim()} size="sm">
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>
    </div>
  )
}

export default function SkillsEditSection({
  control: controlProp,
  categories: categoriesProp,
  onChange,
}: SkillsEditSectionProps) {
  const formContext = useFormContext<FullProfileState>()
  const control = controlProp ?? formContext?.control

  const fieldArray = useFieldArray({
    control,
    name: 'skills',
  })

  const isFieldArrayActive = Boolean(control)
  const categories = isFieldArrayActive ? fieldArray.fields : categoriesProp || []

  const handleUpdateCategory = (index: number, updated: SkillCategory) => {
    if (onChange && categoriesProp) {
      const nextCategories = [...categoriesProp]
      nextCategories[index] = updated
      onChange(nextCategories)
    }
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="border-b border-border-subtle pb-4 mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-main">Skills Architecture</h2>
        <p className="text-xs text-text-muted mt-1">
          Add, edit, or remove technical skills across Languages, Frameworks & Tools, and Databases.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <SkillCategoryEditor
            key={'id' in cat ? (cat.id as string) : cat.label || idx}
            category={cat}
            categoryIndex={idx}
            onUpdateCategory={handleUpdateCategory}
          />
        ))}
      </div>
    </Card>
  )
}
