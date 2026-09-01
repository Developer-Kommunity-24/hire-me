import { Metadata } from 'next'
import { getJobServer } from './get-job'

interface Props {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const job = await getJobServer(id)

  if (!job) {
    return {
      title: 'Job Not Found | Hire Me',
      description: 'The requested job posting could not be found.',
    }
  }

  const title = `${job.title} at ${job.company ?? 'Hire Me'}`
  const description = job.description
    ? job.description.slice(0, 160)
    : `Apply for the ${job.title} position in ${job.location}.`

  return {
    title: `${title} | Hire Me`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/jobs/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
