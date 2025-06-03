'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
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
import { WorkspaceDetail } from '@/constants/user';

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

export function UserManagementDialog({
  workspace,
  isOpen,
  onClose,
  currentUserId,
  onAddUser,
  onRemoveUser
}: UserManagementDialogProps) {
  const [userId, setUserId] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [localWorkspace, setLocalWorkspace] = useState<WorkspaceDetail | null>(
    workspace
  );
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (workspace) {
      setLocalWorkspace(workspace);
    }
  }, [workspace]);

  // 当有操作进行中时，设置阻止状态
  useEffect(() => {
    setIsBlocked(isAddingUser || removingUserId !== null);
  }, [isAddingUser, removingUserId]);

  const handleAddUser = async () => {
    if (localWorkspace && userId) {
      setIsAddingUser(true);
      try {
        await onAddUser(localWorkspace.id, currentUserId, userId, 'member');
        setUserId('');
      } finally {
        setIsAddingUser(false);
      }
    }
  };

  const handleRemoveUser = async (workspaceId: string, userId: string) => {
    setRemovingUserId(userId);
    try {
      await onRemoveUser(workspaceId, userId);
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isBlocked) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="flex h-[90vh] max-h-[800px] w-full max-w-[90vw] flex-col md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {isBlocked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50">
            <div className="animate-pulse text-center">
              <div className="text-lg font-semibold">处理中...</div>
              <div className="mt-2 text-sm text-gray-500">请稍候</div>
            </div>
          </div>
        )}
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
              disabled={isAddingUser}
            />
            <Button onClick={handleAddUser} disabled={isAddingUser || !userId}>
              {isAddingUser ? '添加中...' : '添加成员'}
            </Button>
          </div>
          <Table>
            <TableHeader className="bg-gray-100 shadow-sm">
              <TableRow>
                <TableHead className="w-[200px]">用户名</TableHead>
                <TableHead className="w-[250px]">邮箱</TableHead>
                <TableHead className="w-[120px]">角色</TableHead>
                <TableHead className="w-[200px]">加入时间</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localWorkspace?.users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.join_at}</TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        localWorkspace &&
                        handleRemoveUser(localWorkspace.id, user.id)
                      }
                      disabled={
                        removingUserId === user.id ||
                        user.id === localWorkspace?.owner_user_id ||
                        isAddingUser
                      }
                      title={
                        user.id === localWorkspace?.owner_user_id
                          ? '创建者不可移除'
                          : user.id === currentUserId
                          ? '退出工作空间'
                          : '移除用户'
                      }
                      className={`${
                        removingUserId === user.id ||
                        user.id === localWorkspace?.owner_user_id ||
                        isAddingUser
                          ? 'cursor-not-allowed text-gray-400'
                          : 'text-red-500 hover:text-red-700'
                      }`}
                    >
                      {removingUserId === user.id
                        ? '处理中...'
                        : user.id === currentUserId
                        ? '退出'
                        : '移除'}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={isBlocked}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditWorkspaceDialogProps {
  workspace: WorkspaceDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    workspaceId: string,
    data: {
      name?: string;
      description?: string;
      max_users?: number;
    }
  ) => void;
}

export function EditWorkspaceDialog({
  workspace,
  isOpen,
  onClose,
  onUpdate
}: EditWorkspaceDialogProps) {
  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [maxUsers, setMaxUsers] = useState(workspace?.max_users || 10);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || '');
      setMaxUsers(workspace.max_users);
    }
  }, [workspace]);

  const handleUpdate = async () => {
    if (workspace) {
      setIsUpdating(true);
      try {
        await onUpdate(workspace.id, {
          name,
          description,
          max_users: maxUsers
        });
        onClose();
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isUpdating) {
          onClose();
        }
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {isUpdating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50">
            <div className="animate-pulse text-center">
              <div className="text-lg font-semibold">更新中...</div>
              <div className="mt-2 text-sm text-gray-500">请稍候</div>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>编辑工作空间</DialogTitle>
          <DialogDescription>修改工作空间信息</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="工作空间名称"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="text-sm font-medium">描述</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="工作空间描述"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="text-sm font-medium">最大用户数</label>
            <Input
              type="number"
              value={maxUsers}
              onChange={(e) => setMaxUsers(Number(e.target.value))}
              min={1}
              disabled={isUpdating}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !name}>
              {isUpdating ? '更新中...' : '更新'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
