            'use client';

            import { useState, useEffect } from 'react';
            import { useAuthState } from 'react-firebase-hooks/auth';
            import { auth } from '@/lib/firebase';
            import { boardService } from '@/services/boardService';
            import { toast } from 'sonner';
            import {
              Dialog,
              DialogContent,
              DialogDescription,
              DialogFooter,
              DialogHeader,
              DialogTitle,
            } from '@/components/ui/dialog';
            import { Button } from '@/components/ui/button';
            import { Input } from '@/components/ui/input';
            import { Label } from '@/components/ui/label';
            import { Plus, Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';
            import {
              DropdownMenu,
              DropdownMenuContent,
              DropdownMenuItem,
              DropdownMenuTrigger,
            } from '@/components/ui/dropdown-menu';

            interface Board {
              id: string;
              name: string;
              imageUrls: string[];
            }

            interface AddToBoardModalProps {
              isOpen: boolean;
              onClose: () => void;
              documentId: string | null;
              imageUrl: string | null;
            }

            export function AddToBoardModal({ 
              isOpen, 
              onClose, 
              documentId, 
              imageUrl 
            }: AddToBoardModalProps) {
              const [boards, setBoards] = useState<Board[]>([]);
              const [loadingBoards, setLoadingBoards] = useState(true);
              const [newBoardName, setNewBoardName] = useState('');
              const [creatingBoard, setCreatingBoard] = useState(false);
              const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
              const [editingBoardName, setEditingBoardName] = useState('');
              const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
              const [user] = useAuthState(auth);

              useEffect(() => {
                const fetchBoards = async () => {
                  if (!user) {
                    setLoadingBoards(false);
                    return;
                  }
                  try {
                    setLoadingBoards(true);
                    const userBoards = await boardService.getBoards(user.uid);
                    setBoards(userBoards);
                  } catch (error) {
                    console.error("Failed to load boards:", error);
                    toast.error("Failed to load your boards");
                  } finally {
                    setLoadingBoards(false);
                  }
                };

                if (isOpen) {
                  fetchBoards();
                }
              }, [user, isOpen]);

              const handleAddToBoard = async (boardId: string) => {
                if (!documentId || !imageUrl) return;

                try {
                  await boardService.addDocumentToBoard(boardId, documentId, imageUrl);
                  toast.success("Image added to board successfully!");
                  onClose();
                } catch (error) {
                  console.error("Error adding to board:", error);
                  toast.error("Failed to add image to board");
                }
              };

              const handleCreateBoard = async () => {
                if (!newBoardName.trim() || !user) return;

                try {
                  setCreatingBoard(true);
                  const newBoard = await boardService.createBoard(user.uid, newBoardName.trim());
                  setBoards(prev => [...prev, newBoard]);

                  // Auto-add the image to the new board if we have one
                  if (documentId && imageUrl) {
                    await handleAddToBoard(newBoard.id);
                  } else {
                    toast.success("Board created successfully!");
                    onClose();
                  }

                  setNewBoardName('');
                } catch (error) {
                  console.error("Error creating board:", error);
                  toast.error("Failed to create board");
                } finally {
                  setCreatingBoard(false);
                }
              };

              const handleUpdateBoard = async (boardId: string, newName: string) => {
                if (!newName.trim()) return;

                try {
                  await boardService.updateBoard(boardId, { name: newName.trim() });
                  setBoards(prev => prev.map(board => 
                    board.id === boardId ? { ...board, name: newName.trim() } : board
                  ));
                  setEditingBoardId(null);
                  setEditingBoardName('');
                  toast.success("Board renamed successfully!");
                } catch (error) {
                  console.error("Error updating board:", error);
                  toast.error("Failed to rename board");
                }
              };

              const handleDeleteBoard = async (boardId: string) => {
                try {
                  await boardService.deleteBoard(boardId);
                  setBoards(prev => prev.filter(board => board.id !== boardId));
                  setDeletingBoardId(null);
                  toast.success("Board deleted successfully!");
                } catch (error) {
                  console.error("Error deleting board:", error);
                  toast.error("Failed to delete board");
                }
              };

              const startEditing = (board: Board) => {
                setEditingBoardId(board.id);
                setEditingBoardName(board.name);
              };

              const cancelEditing = () => {
                setEditingBoardId(null);
                setEditingBoardName('');
              };

              const handleClose = () => {
                setNewBoardName('');
                setEditingBoardId(null);
                setEditingBoardName('');
                setDeletingBoardId(null);
                onClose();
              };

              return (
                <Dialog open={isOpen} onOpenChange={handleClose}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add to Board</DialogTitle>
                      <DialogDescription>
                        Create a new board or select an existing one to add this image to
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      {/* Create New Board Input - Always at top */}
                      <div className="flex gap-2">
                        <Input
                          value={newBoardName}
                          onChange={(e) => setNewBoardName(e.target.value)}
                          placeholder="Create new board..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newBoardName.trim()) {
                              handleCreateBoard();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleCreateBoard}
                          disabled={!newBoardName.trim() || creatingBoard}
                        >
                          {creatingBoard ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {loadingBoards ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {boards.map((board) => (
                            <div key={board.id} className="flex items-center gap-2">
                              {editingBoardId === board.id ? (
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    value={editingBoardName}
                                    onChange={(e) => setEditingBoardName(e.target.value)}
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateBoard(board.id, editingBoardName);
                                      } else if (e.key === 'Escape') {
                                        cancelEditing();
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateBoard(board.id, editingBoardName)}
                                    disabled={!editingBoardName.trim()}
                                  >
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    className="justify-start h-auto p-3 flex-1"
                                    onClick={() => handleAddToBoard(board.id)}
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <Folder className="w-4 h-4 flex-shrink-0" />
                                      <div className="text-left flex-1">
                                        <div className="font-medium">{board.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {(board.imageUrls || []).length} image{(board.imageUrls || []).length !== 1 ? 's' : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </Button>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => startEditing(board)}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => setDeletingBoardId(board.id)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={handleClose}>
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={!!deletingBoardId} onOpenChange={() => setDeletingBoardId(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Board</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this board? This action cannot be undone and will remove all images from the board.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingBoardId(null)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => deletingBoardId && handleDeleteBoard(deletingBoardId)}
                        >
                          Delete Board
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Dialog>
              );
            }