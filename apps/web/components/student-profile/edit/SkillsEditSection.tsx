'use client'

import { useState, type KeyboardEvent } from 'react'
import { Check, Pencil, X, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCategoryIcon } from '../utils'
import type { SkillCategory, SkillsEditSectionProps } from '../types'

interface SkillCategoryEditorProps {
  category: SkillCategory
  categoryIndex: number
  onUpdateCategory: (index: number, updated: SkillCategory) => void
}

function SkillCategoryEditor({
  category,
  categoryIndex,
  onUpdateCategory,
}: SkillCategoryEditorProps) {
  const [newSkillText, setNewSkillText] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const handleAddSkill = () => {
    const trimmed = newSkillText.trim()
    if (!trimmed) return
    if (category.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillText('')
      return
    }

    const updated = {
      ...category,
      skills: [...category.skills, trimmed],
    }
    onUpdateCategory(categoryIndex, updated)
    setNewSkillText('')
  }

  const handleAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleRemoveSkill = (skillIndex: number) => {
    const updated = {
      ...category,
      skills: category.skills.filter((_, idx) => idx !== skillIndex),
    }
    onUpdateCategory(categoryIndex, updated)
  }

  const handleStartEdit = (index: number, currentValue: string) => {
    setEditingIndex(index)
    setEditingValue(currentValue)
  }

  const handleSaveEdit = (skillIndex: number) => {
    const trimmed = editingValue.trim()
    if (!trimmed) {
      handleRemoveSkill(skillIndex)
    } else {
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

  return (
    <div className="p-5 rounded-2xl bg-bg-page border border-border-subtle hover:border-border-muted transition-all duration-200 space-y-3.5">
      <div className="flex items-center gap-2">
        <CategoryIcon className="w-4 h-4 text-brand-dark" />
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {category.label}
        </h3>
        <span className="text-xs text-text-muted/60 font-mono">({category.skills.length})</span>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[36px] items-center">
        {category.skills.length === 0 ? (
          <span className="text-xs text-text-muted/60 italic">
            No skills added yet in this category.
          </span>
        ) : (
          category.skills.map((skill, sIdx) => {
            const isEditing = editingIndex === sIdx

            if (isEditing) {
              return (
                <div
                  key={sIdx}
                  className="inline-flex items-center gap-1 bg-card border-2 border-brand rounded-lg px-1.5 py-0.5 shadow-xs"
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, sIdx)}
                    onBlur={() => handleSaveEdit(sIdx)}
                    autoFocus
                    className="text-xs font-mono text-text-main bg-transparent outline-none w-24 px-1"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSaveEdit(sIdx)
                    }}
                    className="text-brand-dark hover:text-brand p-1 rounded-lg hover:bg-brand-light active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand"
                    title="Save skill"
                    aria-label={`Save ${skill}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            }

            return (
              <div
                key={sIdx}
                className="group inline-flex items-center gap-1.5 bg-card text-text-main text-xs font-mono px-2.5 py-1 rounded-lg border border-border-subtle shadow-xs hover:border-border-muted transition-all"
              >
                <span>{skill}</span>

                <button
                  type="button"
                  onClick={() => handleStartEdit(sIdx, skill)}
                  className="opacity-60 hover:opacity-100 text-text-muted hover:text-brand-dark hover:bg-bg-page active:scale-95 transition-all duration-150 cursor-pointer p-0.5 rounded"
                  title="Edit skill"
                  aria-label={`Edit ${skill}`}
                >
                  <Pencil className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(sIdx)}
                  className="opacity-60 hover:opacity-100 text-text-muted hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all duration-150 cursor-pointer p-0.5 rounded"
                  title="Remove skill"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="w-3 h-3" />
                </button>
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

export default function SkillsEditSection({ categories, onChange }: SkillsEditSectionProps) {
  const handleUpdateCategory = (index: number, updated: SkillCategory) => {
    const nextCategories = [...categories]
    nextCategories[index] = updated
    onChange(nextCategories)
  }

  return (
    <Card as="section" className="p-6 sm:p-7">
      <div className="border-b border-border-subtle pb-4 mb-6">
        <h2 className="text-xl font-bold tracking-tight text-text-main">Skills Architecture</h2>
        <p className="text-xs text-text-muted mt-1">
          Add, edit, or remove technical skills across Languages, Frameworks & Tools, and Databases.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <SkillCategoryEditor
            key={cat.label}
            category={cat}
            categoryIndex={idx}
            onUpdateCategory={handleUpdateCategory}
          />
        ))}
      </div>
    </Card>
  )
}
