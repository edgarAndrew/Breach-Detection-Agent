'use client'

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Trash2, CircleArrowOutUpRightIcon } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getOperatorText } from "@/lib/rule"
import Rule from "@/types/rule"
import { PAGE_SIZE } from "@/constants/shared"
import { deleteRule, getOrgRules } from "@/lib/api/rule"
import { toast } from "sonner"

function formatRule(rule: Rule) {
  return (
    <>
      <span className="font-semibold">If</span>{" "}
      <span>{rule.attribute_name}</span>{" "}
      <span className="text-muted-foreground">
        {getOperatorText(rule.operator)}
      </span>{" "}
      <span>{rule.threshold}</span>{" "}
      <span className="text-muted-foreground">
        within {rule.near_thres}%
      </span>
    </>
  )
}

function RuleTable() {
  const [rules, setRules] = useState<Rule[]>([])
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filteredRules = useMemo(() => {
    const q = search.toLowerCase()
    return rules.filter((r) => `${r.attribute_name.toUpperCase()} ${getOperatorText(r.operator)} ${r.threshold}`.toLowerCase().includes(q))
  }, [rules, search])

  const totalPages = Math.ceil(filteredRules.length / PAGE_SIZE)

  const pageRules = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredRules.slice(start, start + PAGE_SIZE)
  }, [filteredRules, page])

  async function handleDelete(id: string) {
    setRules((prev) => prev.filter((r) => r._id !== id))
    try {
      const response = await deleteRule(id)
      if (response.status === 204) {
        toast.success("Rule deleted successfully")
      } else {
        toast.error("Failed to delete rule")
      }
    }
    catch (error) {
      console.log(error)
      toast.error("Failed to delete rule")
    }
  }

  useEffect(() => {
    async function fetchRules() {
      const response = await getOrgRules()
      if (response.status !== 200) {
        toast.error("Failed to fetch rules")
        return
      }
      setRules(response.data)
      toast.success("Rules loaded successfully")
    }
    fetchRules()
  }, [])

  return (
    <section className="space-y-4">
      <Input
        placeholder="Search by field ..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        className="w-full"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm md:text-base font-semibold text-muted-foreground">
              Rule ID
            </TableHead>
            <TableHead className="text-sm md:text-base font-semibold text-muted-foreground">
              Rule Name
            </TableHead>
            <TableHead className="text-sm md:text-base font-semibold text-muted-foreground">
              Rule
            </TableHead>
            <TableHead className="w-20 text-right text-sm md:text-base font-semibold text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-muted-foreground">
                No rules found
              </TableCell>
            </TableRow>
          ) : (
            pageRules.map((rule) => (
              <TableRow key={rule._id}>
                <TableCell className="text-base font-medium leading-relaxed">{rule._id}</TableCell>
                <TableCell className="text-base font-medium leading-relaxed">{rule.rule_name}</TableCell>
                <TableCell className="text-base font-medium leading-relaxed">
                  {formatRule(rule)}
                </TableCell>

                <TableCell className="text-right space-x-2">
                  <Link href={`/dashboard/rules/${rule._id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary hover:scale-110">
                      <CircleArrowOutUpRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:scale-110" onClick={() => setRuleToDelete(rule)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <AlertDialog open={!!ruleToDelete} onOpenChange={(open) => { if (!open) setRuleToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              The rule will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (ruleToDelete) {
                  handleDelete(ruleToDelete._id)
                  setRuleToDelete(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
            </PaginationItem>
            <PaginationItem className="px-2 text-sm">
              Page {page} of {totalPages}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  )
}

export default RuleTable;