
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Send, Reply, Trash2 } from 'lucide-react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { toast } from 'sonner'
import { 
  getCommentsByStoryId, 
  addComment, 
  addReply, 
  deleteComment,
  type Comment 
} from '@/services/commentsService'

interface ShortsCommentsProps {
  videoId: string
}

export function ShortsComments({ videoId }: ShortsCommentsProps) {
  const [user] = useAuthState(auth)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [videoId])

  const loadComments = async () => {
    try {
      const commentsData = await getCommentsByStoryId(videoId)
      setComments(commentsData)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return

    try {
      const commentData = {
        storyId: videoId,
        authorId: user.uid,
        author: user.displayName || 'Anonymous',
        content: newComment.trim(),
        timestamp: Date.now()
      }

      await addComment(commentData)
      setNewComment('')
      await loadComments()
      toast.success('Comment added!')
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!user || !replyText.trim()) return

    try {
      const replyData = {
        storyId: videoId,
        authorId: user.uid,
        author: user.displayName || 'Anonymous',
        content: replyText.trim(),
        timestamp: Date.now(),
        parentId
      }

      await addReply(replyData)
      setReplyText('')
      setReplyingTo(null)
      await loadComments()
      toast.success('Reply added!')
    } catch (error) {
      console.error('Failed to add reply:', error)
      toast.error('Failed to add reply')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return

    try {
      await deleteComment(commentId)
      await loadComments()
      toast.success('Comment deleted')
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const mainComments = comments.filter(comment => !comment.parentId)
  const getReplies = (commentId: string) => 
    comments.filter(comment => comment.parentId === commentId)

  if (loading) {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="text-center text-muted-foreground">Loading comments...</div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
        
        {/* Comments list */}
        <div className="space-y-4 mb-6">
          {mainComments.map((comment) => {
            const replies = getReplies(comment.id)
            return (
              <div key={comment.id} className="space-y-2">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                        {comment.author?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTime(comment.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply className="w-4 h-4" />
                      </Button>
                      {comment.authorId === user?.uid && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                  
                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 flex gap-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 text-sm resize-none"
                        rows={2}
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 bg-primary text-primary-foreground text-xs">
                              {reply.author?.[0]?.toUpperCase() || '?'}
                            </Avatar>
                            <span className="text-xs font-medium">{reply.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(reply.timestamp)}
                            </span>
                          </div>
                          {reply.authorId === user?.uid && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive h-6 w-6 p-0"
                              onClick={() => handleDeleteComment(reply.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {mainComments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to comment!
              </p>
            </div>
          )}
        </div>

        {/* New comment input */}
        <div className="border-t pt-4">
          <div className="flex gap-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Add a comment..." : "Sign in to add a comment"}
              className="flex-1 resize-none"
              rows={3}
              disabled={!user}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || !user}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!user && (
            <p className="text-xs text-muted-foreground mt-2">
              Sign in to join the conversation
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
