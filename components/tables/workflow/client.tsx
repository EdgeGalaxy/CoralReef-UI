'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { columns } from './columns';
import { Workflow } from '@/constants/deploy';
import { EditWorkflowModal } from '@/components/modal/edit-workflow';
import { AlertModal } from '@/components/modal/alert-modal';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';

interface Props {
  workflows: Workflow[];
  workspaceId: string | undefined;
  onWorkflowsChange: () => void;
}

export function WorkflowTable({
  workflows,
  workspaceId,
  onWorkflowsChange
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const api = useAuthApi();

  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deletingWorkflow, setDeletingWorkflow] = useState<Workflow | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = (workflow: Workflow, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const actionButton = target.closest('[data-action]');

    if (actionButton) {
      e.stopPropagation();
      const action = actionButton.getAttribute('data-action');

      if (action === 'edit') {
        setEditingWorkflow(workflow);
        setIsEditModalOpen(true);
      } else if (action === 'delete') {
        setDeletingWorkflow(workflow);
        setIsDeleteModalOpen(true);
      }

      return;
    }

    if (workflow.data) {
      router.push(`/dashboard/workflow/${workflow.id}`);
    } else {
      toast({
        title: `${workflow.name} 工作流数据为空`,
        description: '数据不完整，无法编辑，非当前平台编辑创建',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingWorkflow) return;

    setIsDeleting(true);
    try {
      await handleApiRequest(
        () =>
          api.delete(
            `api/reef/workspaces/${workspaceId}/workflows/${deletingWorkflow.id}`
          ),
        {
          toast,
          successTitle: '工作流删除成功',
          errorTitle: '工作流删除失败',
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            onWorkflowsChange();
          }
        }
      );
    } finally {
      setIsDeleting(false);
      setDeletingWorkflow(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader className="bg-gray-100 shadow-sm">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((workflow) => (
            <TableRow
              key={workflow.id}
              onClick={(e) => handleClick(workflow, e)}
              className="cursor-pointer"
            >
              {columns.map((column) => (
                <TableCell key={column.accessorKey}>
                  {column.accessorKey === 'actions' ? (
                    <div className="flex items-center gap-2">
                      <button
                        data-action="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWorkflow(workflow);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        编辑
                      </button>
                      <button
                        data-action="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingWorkflow(workflow);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        删除
                      </button>
                    </div>
                  ) : column.cell ? (
                    column.cell({ row: { original: workflow } })
                  ) : (
                    String(workflow[column.accessorKey as keyof Workflow] || '')
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingWorkflow && (
        <EditWorkflowModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingWorkflow(null);
          }}
          workflow={editingWorkflow}
          workspaceId={workspaceId}
          onSuccess={onWorkflowsChange}
        />
      )}

      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingWorkflow(null);
        }}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
