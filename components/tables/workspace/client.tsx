'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { WorkspaceDetail } from '@/types/workspace';
import { Pagination } from '@/components/tables/pagination';
import { WorkspaceResponse } from '@/components/hooks/use-workspaces';

interface WorkspaceTableProps {
  workspaces: WorkspaceResponse;
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
}

interface UserManagementDialogProps {
  workspace: WorkspaceDetail | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onAddUser: (
    workspaceId: string,
    ownerUserId: string,
    userId: string,
    role: string
  ) => void;
  onRemoveUser: (workspaceId: string, userId: string) => void;
}

function UserManagementDialog({
  workspace,
  isOpen,
  onClose,
  currentUserId,
  onAddUser,
  onRemoveUser
}: UserManagementDialogProps) {
  const [userId, setUserId] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[90vh] max-h-[800px] w-full max-w-[90vw] flex-col md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>管理工作空间成员</DialogTitle>
          <DialogDescription>添加或移除工作空间成员</DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-4 overflow-y-auto">
          <div className="flex space-x-2">
            <Input
              placeholder="用户ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Button
              onClick={() => {
                if (workspace && userId) {
                  onAddUser(workspace.id, currentUserId, userId, 'member');
                  setUserId('');
                }
              }}
            >
              添加成员
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">用户名</TableHead>
                <TableHead className="w-[250px]">邮箱</TableHead>
                <TableHead className="w-[120px]">角色</TableHead>
                <TableHead className="w-[200px]">加入时间</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspace?.users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.join_at}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        workspace && onRemoveUser(workspace.id, user.id)
                      }
                      disabled={user.id === currentUserId}
                      title={
                        user.id === currentUserId
                          ? '无法移除当前用户'
                          : '移除用户'
                      }
                    >
                      移除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WorkspaceTable({
  workspaces,
  mutate,
  currentUserId,
  onPageChange,
  onPageSizeChange,
  onManageUsers,
  onRemoveUser,
  onDelete
}: WorkspaceTableProps) {
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceDetail | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

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
      }
    }
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
        onClose={() => setIsUserDialogOpen(false)}
        currentUserId={currentUserId}
        onAddUser={onManageUsers}
        onRemoveUser={onRemoveUser}
      />
    </div>
  );
}
