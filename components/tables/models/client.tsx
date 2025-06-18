'use client';

import { columns } from './columns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { MLModel } from '@/constants/models';
import { useState } from 'react';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';
import { useToast } from '@/components/ui/use-toast';
import { AlertModal } from '@/components/modal/alert-modal';
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from '@tanstack/react-table';

interface Props {
  models: MLModel[];
  workspaceId: string;
  onSelectModel: (model: MLModel) => void;
  onModelsChange: () => void;
}

interface ModelTableMeta {
  onToggleVisibility: (model: MLModel) => void;
  onDelete: (model: MLModel) => void;
}

export function ModelTable({
  models,
  workspaceId,
  onSelectModel,
  onModelsChange
}: Props) {
  const { toast } = useToast();
  const api = useAuthApi();
  const [deletingModel, setDeletingModel] = useState<MLModel | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 处理可见性切换
  const handleToggleVisibility = async (model: MLModel) => {
    const modelWorkspaceId = model.workspace_id || workspaceId;
    try {
      await handleApiRequest(
        () =>
          api.put(
            `api/reef/workspaces/${modelWorkspaceId}/models/${
              model.id
            }/visibility/${!model.is_public}`
          ),
        {
          toast,
          successTitle: `模型已${model.is_public ? '设为私密' : '设为公开'}`,
          errorTitle: '操作失败',
          onSuccess: () => {
            onModelsChange();
          }
        }
      );
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  // 处理删除模型
  const handleDelete = async () => {
    if (!deletingModel) return;

    setIsDeleting(true);
    try {
      await handleApiRequest(
        () =>
          api.delete(
            `api/reef/workspaces/${workspaceId}/models/${deletingModel.id}`
          ),
        {
          toast,
          successTitle: '模型删除成功',
          errorTitle: '删除失败',
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            onModelsChange();
          }
        }
      );
    } finally {
      setIsDeleting(false);
      setDeletingModel(null);
    }
  };

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onToggleVisibility: handleToggleVisibility,
      onDelete: (model: MLModel) => {
        setDeletingModel(model);
        setIsDeleteModalOpen(true);
      }
    } as ModelTableMeta
  });

  return (
    <>
      <Table>
        <TableHeader className="bg-gray-100 shadow-sm">
          <TableRow>
            {table.getFlatHeaders().map((header) => (
              <TableHead key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onSelectModel(row.original)}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="确认删除"
        description="确定要删除这个模型吗？此操作不可逆。"
      />
    </>
  );
}
