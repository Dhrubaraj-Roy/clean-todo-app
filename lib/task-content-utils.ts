/**
 * Utility functions to analyze task content structure
 */

export interface TaskContentAnalysis {
  hasSubtasks: boolean
  hasLinks: boolean
  subtaskCount: number
  linkCount: number
}

export function analyzeTaskContent(details: any): TaskContentAnalysis {
  const analysis: TaskContentAnalysis = {
    hasSubtasks: false,
    hasLinks: false,
    subtaskCount: 0,
    linkCount: 0
  }

  if (!details) return analysis

  // Check for direct subtasks and links from subtask manager
  if (details.subtasks && Array.isArray(details.subtasks)) {
    analysis.hasSubtasks = true
    analysis.subtaskCount = details.subtasks.length
  }

  if (details.links && Array.isArray(details.links)) {
    analysis.hasLinks = true
    analysis.linkCount = details.links.length
  }

  // Also check TipTap content for backward compatibility
  if (details.content) {
    const countInNode = (node: any) => {
      if (!node) return

      // Check for task list items (subtasks)
      if (node.type === 'taskList' || node.type === 'taskItem') {
        if (!analysis.hasSubtasks) {
          analysis.hasSubtasks = true
        }
        if (node.type === 'taskItem') {
          analysis.subtaskCount++
        }
      }

      // Check for links
      if (node.type === 'link' || (node.marks && node.marks.some((mark: any) => mark.type === 'link'))) {
        if (!analysis.hasLinks) {
          analysis.hasLinks = true
        }
        analysis.linkCount++
      }

      // Recursively check child nodes
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(countInNode)
      }
    }

    if (Array.isArray(details.content)) {
      details.content.forEach(countInNode)
    } else {
      countInNode(details.content)
    }
  }

  return analysis
}

export function getTaskContentSummary(details: any): string {
  const analysis = analyzeTaskContent(details)
  const parts = []

  if (analysis.hasSubtasks) {
    parts.push(`${analysis.subtaskCount} subtask${analysis.subtaskCount !== 1 ? 's' : ''}`)
  }

  if (analysis.hasLinks) {
    parts.push(`${analysis.linkCount} link${analysis.linkCount !== 1 ? 's' : ''}`)
  }

  return parts.join(' • ')
}
