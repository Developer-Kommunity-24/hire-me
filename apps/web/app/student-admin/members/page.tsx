'use client'

import { useQuery } from '@tanstack/react-query'
import { Users, TrendingUp, Clock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import AddMembers from './AddMemberForm'
import BulkImportForm from './BulkImportForm'
import AllMembersTable from './AllMembersTable'
import { fetchMembers, membersQueryKey } from './members-data'

export default function MembersPage() {
  const { data: members = [] } = useQuery({
    queryKey: membersQueryKey,
    queryFn: fetchMembers,
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Members</h1>

      <div className="flex gap-4 mb-6">
        <Card className="flex-1">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="text-text-muted" />
            <div>
              <p className="text-sm text-text-muted">Total Members</p>
              <p className="text-xl font-semibold">{members.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="text-text-muted" />
            <div>
              <p className="text-sm text-text-muted">Active This Week</p>
              <p className="text-xl font-semibold">34</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="text-text-muted" />
            <div>
              <p className="text-sm text-text-muted">Pending Invites</p>
              <p className="text-xl font-semibold">5</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Members</TabsTrigger>
          <TabsTrigger value="individual">Add Individually</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <AllMembersTable />
        </TabsContent>
        <TabsContent value="individual">
          <AddMembers />
        </TabsContent>
        <TabsContent value="bulk">
          <BulkImportForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
