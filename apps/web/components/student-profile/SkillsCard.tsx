import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { defaultSkillCategories } from './ProfileContext'
import { getCategoryIcon } from './utils'
import type { SkillCategory } from './types'

function SkillGroup({ category }: { category: SkillCategory }) {
  const CategoryIcon = getCategoryIcon(category.label)

  return (
    <div role="group" aria-label={`${category.label} skills`}>
      <div className="flex items-center gap-1.5 mb-2">
        <CategoryIcon className="w-4 h-4 text-text-muted" />
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {category.label}
        </span>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label={category.label}>
        {category.skills.map((skill) => (
          <li key={skill}>
            <Badge variant="outline">{skill}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SkillsCard({
  categories = defaultSkillCategories,
}: {
  categories?: SkillCategory[]
}) {
  return (
    <Card as="section" className="p-6 sm:p-7">
      <h2 className="text-lg font-bold text-text-main tracking-tight mb-4">Skills Architecture</h2>
      <div className="space-y-4">
        {categories.map((category) => (
          <SkillGroup key={category.label} category={category} />
        ))}
      </div>
    </Card>
  )
}
