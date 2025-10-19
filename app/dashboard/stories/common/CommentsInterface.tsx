
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Send, Reply, Trash2 } from 'lucide-react';
import type { FilmProject } from '@/types/storytypes';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  replies?: Comment[];
}

interface CommentsInterfaceProps {
  project: FilmProject;
  onUpdateProject: (updatedProject: FilmProject) => void;
}

export const CommentsInterface: React.FC<CommentsInterfaceProps> = ({
  project,
  onUpdateProject
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [authorName, setAuthorName] = useState('Anonymous');

  // Mock comments for now - in real app this would come from Firebase
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Director',
      content: 'Love the opening scene! Can we make it more dramatic?',
      timestamp: Date.now() - 3600000,
      replies: [
        {
          id: '2',
          author: 'Writer',
          content: 'Sure! I can add more tension to the dialogue.',
          timestamp: Date.now() - 3000000
        }
      ]
    }
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: authorName,
      content: newComment,
      timestamp: Date.now(),
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      author: authorName,
      content: replyContent,
      timestamp: Date.now()
    };

    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
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

  return (
    <div className="h-full flex flex-col">
      {/* Author name input */}
      <div className="flex-shrink-0 p-3 border-b border-border">
        <Input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="text-xs"
        />
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 bg-primary text-primary-foreground text-xs">
                    {comment.author[0].toUpperCase()}
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
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-destructive"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-foreground">{comment.content}</p>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-4 space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="bg-muted/30 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-5 h-5 bg-secondary text-secondary-foreground text-xs">
                        {reply.author[0].toUpperCase()}
                      </Avatar>
                      <span className="text-xs font-medium">{reply.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(reply.timestamp)}
                      </span>
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
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleAddReply(comment.id)}
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
        ))}

        {comments.length === 0 && (
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
          />
          <Button
            size="icon"
            className="h-12 w-12"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
