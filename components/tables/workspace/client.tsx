'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from '@tanstack/react-table';
import { columns } from './columns';
import { Pagination } from '@/components/tables/pagination';
import { PaginationResponse, WorkspaceDetail } from '@/constants/user';
import { UserManagementDialog, EditWorkspaceDialog } from './dialogs';

interface WorkspaceTableProps {
  workspaces: PaginationResponse<WorkspaceDetail>;
  mutate: () => Promise<any>;
  currentUserId: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onManageUsers: (
    workspaceId: string,
    ownerUserId: string,
    userId: string,
    role: string
  ) => void;
  onRemoveUser: (workspaceId: string, userId: string) => void;
  onDelete: (workspaceId: string) => void;
  onUpdate: (
    workspaceId: string,
    data: {
      name?: string;
      description?: string;
      max_users?: number;
    }
  ) => void;
}

export function WorkspaceTable({
  workspaces,
  mutate,
  currentUserId,
  onPageChange,
  onPageSizeChange,
  onManageUsers,
  onRemoveUser,
  onDelete,
  onUpdate
}: WorkspaceTableProps) {
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceDetail | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleManageUsers = async (
    workspaceId: string,
    ownerUserId: string,
    userId: string,
    role: string
  ) => {
    await onManageUsers(workspaceId, ownerUserId, userId, role);
    // 刷新工作空间用户列表
    await mutate();

    // 重新获取最新的工作空间数据并更新选中的工作空间
    const updatedWorkspaces = await mutate();
    if (updatedWorkspaces && updatedWorkspaces.items) {
      const updatedWorkspace = updatedWorkspaces.items.find(
        (w: WorkspaceDetail) => w.id === workspaceId
      );
      if (updatedWorkspace) {
        setSelectedWorkspace(updatedWorkspace);
      }
    }
  };

  const handleRemoveUser = async (workspaceId: string, userId: string) => {
    await onRemoveUser(workspaceId, userId);
    // 刷新工作空间用户列表
    await mutate();

    // 重新获取最新的工作空间数据并更新选中的工作空间
    const updatedWorkspaces = await mutate();
    if (updatedWorkspaces && updatedWorkspaces.items) {
      const updatedWorkspace = updatedWorkspaces.items.find(
        (w: WorkspaceDetail) => w.id === workspaceId
      );
      if (updatedWorkspace) {
        setSelectedWorkspace(updatedWorkspace);
      }
    }
  };

  const table = useReactTable({
    data: workspaces.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onManageUsers: (workspace: WorkspaceDetail) => {
        setSelectedWorkspace(workspace);
        setIsUserDialogOpen(true);
      },
      onRemoveUser: (workspaceId: string, userId: string) => {
        onRemoveUser(workspaceId, userId);
      },
      onDelete: (workspaceId: string) => {
        onDelete(workspaceId);
      },
      onUpdate: (workspace: WorkspaceDetail) => {
        setSelectedWorkspace(workspace);
        setIsEditDialogOpen(true);
      }
    }
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={workspaces.page}
        pageSize={workspaces.page_size}
        total={workspaces.total}
        totalPages={workspaces.total_pages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <UserManagementDialog
        workspace={selectedWorkspace}
        isOpen={isUserDialogOpen}
        onClose={() => {
          setIsUserDialogOpen(false);
          setSelectedWorkspace(null);
        }}
        currentUserId={currentUserId}
        onAddUser={handleManageUsers}
        onRemoveUser={handleRemoveUser}
      />

      <EditWorkspaceDialog
        workspace={selectedWorkspace}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedWorkspace(null);
        }}
        onUpdate={onUpdate}
      />
    </div>
  );
}
