import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Send, Reply, Trash2 } from 'lucide-react';
import type { FilmProject } from '@/types/storytypes';
import { 
  getCommentsByStoryId, 
  addComment, 
  addReply, 
  deleteComment,
  type Comment 
} from '@/services/commentsService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface CommentsInterfaceProps {
  project: FilmProject;
  onUpdateProject: (updatedProject: FilmProject) => void;
}

export const CommentsInterface: React.FC<CommentsInterfaceProps> = ({
  project,
  onUpdateProject
}) => {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [authorName, setAuthorName] = useState('Anonymous');

  // Sync author name with Firebase user
  useEffect(() => {
    if (user) {
      setAuthorName(user.displayName || 'Anonymous');
    } else {
      setAuthorName('Anonymous');
    }
  }, [user]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const storyComments = await getCommentsByStoryId(project.id);
        setComments(storyComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [project.id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const commentId = await addComment({
        storyId: project.id,
        author: authorName,
        authorId: user.uid,
        content: newComment,
      });

      const newCommentObj: Comment = {
        id: commentId,
        storyId: project.id,
        author: authorName,
        authorId: user.uid,
        content: newComment,
        timestamp: Date.now(),
      };

      setComments([newCommentObj, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      const replyId = await addReply({
        storyId: project.id,
        author: authorName,
        authorId: user.uid,
        content: replyContent,
        parentId,
      });

      const newReply: Comment = {
        id: replyId,
        storyId: project.id,
        author: authorName,
        authorId: user.uid,
        content: replyContent,
        timestamp: Date.now(),
        parentId,
      };

      setComments([newReply, ...comments]);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const mainComments = comments.filter(comment => !comment.parentId);
  const getReplies = (commentId: string) => 
    comments.filter(comment => comment.parentId === commentId);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {mainComments.map((comment) => {
          const replies = getReplies(comment.id);
          return (
            <div key={comment.id} className="space-y-2">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 bg-primary text-primary-foreground text-xs">
                      {comment.author?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <span className="text-xs font-medium">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(comment.timestamp)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <Reply className="w-3 h-3" />
                    </Button>
                    {(comment.authorId === user?.uid) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-foreground">{comment.content}</p>
              </div>

              {/* Replies */}
              {replies.length > 0 && (
                <div className="ml-4 space-y-2">
                  {replies.map((reply) => (
                    <div key={reply.id} className="bg-muted/30 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-5 h-5 bg-secondary text-secondary-foreground text-xs">
                          {reply.author?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <span className="text-xs font-medium">{reply.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(reply.timestamp)}
                        </span>
                        {(reply.authorId === user?.uid) && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-4 w-4 text-destructive ml-auto"
                            onClick={() => handleDeleteComment(reply.id)}
                          >
                            <Trash2 className="w-2 h-2" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-foreground ml-7">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {replyingTo === comment.id && (
                <div className="ml-4 flex gap-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 text-xs resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddReply(comment.id);
                      }
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyContent.trim()}
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setReplyingTo(null)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {mainComments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start the conversation!
            </p>
          </div>
        )}
      </div>

      {/* New comment input */}
      <div className="flex-shrink-0 p-3 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-xs resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <Button
            size="icon"
            className="h-12 w-12"
            onClick={handleAddComment}
            disabled={!newComment.trim() || !user}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {!user && (
          <p className="text-xs text-muted-foreground mt-2">
            Sign in to add comments
          </p>
        )}
      </div>
    </div>
  );
};
