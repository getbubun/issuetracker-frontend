export interface CreateIssue {
    issueId?: string,
    title: string;
    description: string;
    assignee: string;
    createdBy?:string;
    attachment: string;
    status?:string;
}
