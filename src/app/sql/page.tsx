'use client'

import React, { useState, useEffect } from 'react'
import { Tables } from '@/types/db/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserStore } from '@/store/user'

type ChatHistory = Tables<'chat_histories'>
type LlmConversation = Tables<'llm_conversations'>

export default function SqlPage() {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([])
  const [llmConversations, setLlmConversations] = useState<LlmConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useUserStore((state) => state.user)

  // Form states
  const [newChatHistory, setNewChatHistory] = useState<Omit<ChatHistory, 'id' | 'create_time'>>({ 
    subject: '', 
    user_id: user?.id || null
  })
  
  const [newLlmConversation, setNewLlmConversation] = useState<Omit<LlmConversation, 'id' | 'create_time'>>({ 
    content: '', 
    history_id: '', 
    user_id: user?.id || '',
    type: 'user',
    reasoning: null
  })

  // Fetch data using our API route
  const fetchData = async () => {
    try {
      if (!user?.id) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      setLoading(true)
      
      const response = await fetch(`/api/sql?userId=${user.id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data')
      }
      
      setChatHistories(data.chatHistories || [])
      setLlmConversations(data.llmConversations || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Create chat history
  const createChatHistory = async () => {
    try {
      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      const response = await fetch('/api/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat_history',
          data: newChatHistory,
          userId: user.id
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create chat history')
      }
      
      // Refresh the data
      fetchData()
      setNewChatHistory({ subject: '', user_id: user.id })
    } catch (err) {
      console.error('Error creating chat history:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  // Create llm conversation
  const createLlmConversation = async () => {
    try {
      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      // If no history_id is provided, create a new chat history first
      let historyId = newLlmConversation.history_id
      if (!historyId) {
        // Create a new chat history record
        const chatHistoryResponse = await fetch('/api/sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'chat_history',
            data: { 
              subject: 'New Conversation', 
              user_id: user.id 
            },
            userId: user.id
          }),
        })
        
        const chatHistoryData = await chatHistoryResponse.json()
        
        if (!chatHistoryResponse.ok) {
          throw new Error(chatHistoryData.error || 'Failed to create chat history')
        }
        
        // Use the ID of the newly created chat history
        historyId = chatHistoryData[0]?.id
      }

      // Create the LLM conversation with the history_id
      const llmData = {
        ...newLlmConversation,
        history_id: historyId
      }

      const response = await fetch('/api/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'llm_conversation',
          data: llmData,
          userId: user.id
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create LLM conversation')
      }
      
      // Refresh the data
      fetchData()
      setNewLlmConversation({ content: '', history_id: '', user_id: user.id, type: 'user', reasoning: null })
    } catch (err) {
      console.error('Error creating llm conversation:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  // Update chat history
  const updateChatHistory = async (id: string, updates: Partial<ChatHistory>) => {
    try {
      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      const response = await fetch('/api/sql', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat_history',
          id,
          data: updates,
          userId: user.id
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update chat history')
      }
      
      // Refresh the data
      fetchData()
    } catch (err) {
      console.error('Error updating chat history:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  // Update llm conversation
  const updateLlmConversation = async (id: string, updates: Partial<LlmConversation>) => {
    try {
      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      const response = await fetch('/api/sql', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'llm_conversation',
          id,
          data: updates,
          userId: user.id
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update LLM conversation')
      }
      
      // Refresh the data
      fetchData()
    } catch (err) {
      console.error('Error updating llm conversation:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  // Delete chat history
  const deleteChatHistory = async (id: string) => {
    try {
      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      const response = await fetch(`/api/sql?type=chat_history&id=${id}&userId=${user.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete chat history')
      }
      
      // Refresh the data
      fetchData()
    } catch (err) {
      console.error('Error deleting chat history:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  // Delete llm conversation
  const deleteLlmConversation = async (id: string) => {
    try {
      if (!user?.id) {
        setError('User not authenticated')
        return
      }

      const response = await fetch(`/api/sql?type=llm_conversation&id=${id}&userId=${user.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete LLM conversation')
      }
      
      // Refresh the data
      fetchData()
    } catch (err) {
      console.error('Error deleting llm conversation:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!user) {
    return <div className="p-4">Please log in to access this page.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SQL Database Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chat Histories Section */}
        <Card>
          <CardHeader>
            <CardTitle>Chat Histories</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Create Form */}
            <div className="mb-6 p-4 border rounded">
              <h2 className="text-lg font-semibold mb-2">Create Chat History</h2>
              <div className="space-y-2">
                {/* Content ID field removed as it no longer exists in the chat_histories table */}
                <Input
                  placeholder="Subject"
                  value={newChatHistory.subject || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChatHistory({...newChatHistory, subject: e.target.value})}
                />
                <Button onClick={createChatHistory}>Create</Button>
              </div>
            </div>
            
            {/* List */}
            <ScrollArea className="h-[400px]">
              {chatHistories.map((history) => (
                <div key={history.id} className="mb-4 p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">ID: {history.id}</p>
                      {/* Content ID field removed as it no longer exists in the chat_histories table */}
                      <p>Subject: {history.subject || 'No subject'}</p>
                      <p>User ID: {history.user_id}</p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(history.create_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newSubject = prompt('Enter new subject:', history.subject || '')
                          if (newSubject !== null) {
                            updateChatHistory(history.id, { subject: newSubject })
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteChatHistory(history.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* LLM Conversations Section */}
        <Card>
          <CardHeader>
            <CardTitle>LLM Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Create Form */}
            <div className="mb-6 p-4 border rounded">
              <h2 className="text-lg font-semibold mb-2">Create LLM Conversation</h2>
              <div className="space-y-2">
                <Textarea
                  placeholder="Content"
                  value={newLlmConversation.content || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLlmConversation({...newLlmConversation, content: e.target.value})}
                />
                <Input
                  placeholder="History ID (leave empty to auto-create)"
                  value={newLlmConversation.history_id || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLlmConversation({...newLlmConversation, history_id: e.target.value})}
                />
                <p className="text-sm text-gray-500">If left empty, a new chat history will be automatically created.</p>
                <Button onClick={createLlmConversation}>Create</Button>
              </div>
            </div>
            
            {/* List */}
            <ScrollArea className="h-[400px]">
              {llmConversations.map((conversation) => (
                <div key={conversation.id} className="mb-4 p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">ID: {conversation.id}</p>
                      <p className="truncate max-w-xs">Content: {conversation.content || 'No content'}</p>
                      <p>History ID: {conversation.history_id || 'No history (auto-created when needed)'}</p>
                      <p>User ID: {conversation.user_id}</p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(conversation.create_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const newContent = prompt('Enter new content:', conversation.content || '')
                          let newHistoryId = prompt('Enter new history ID (leave empty to keep current, type "new" to create one, or enter an existing ID):', conversation.history_id || '')
                          
                          // If no history ID is provided, create a new chat history
                          if (newHistoryId === '' || newHistoryId === null) {
                            // Keep the existing history_id
                            newHistoryId = conversation.history_id
                          } else if (newHistoryId === 'new') {
                            // Create a new chat history
                            try {
                              const chatHistoryResponse = await fetch('/api/sql', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  type: 'chat_history',
                                  data: { 
                                    subject: 'New Conversation', 
                                    user_id: user.id 
                                  },
                                  userId: user.id
                                }),
                              })
                              
                              const chatHistoryData = await chatHistoryResponse.json()
                              
                              if (chatHistoryResponse.ok && chatHistoryData[0]?.id) {
                                newHistoryId = chatHistoryData[0].id
                              } else {
                                throw new Error(chatHistoryData.error || 'Failed to create chat history')
                              }
                            } catch (err) {
                              console.error('Error creating chat history:', err)
                              alert('Failed to create new chat history: ' + (err instanceof Error ? err.message : 'Unknown error'))
                              return
                            }
                          }
                          
                          if (newContent !== null) {
                            const updates: Partial<LlmConversation> = { content: newContent }
                            if (newHistoryId) {
                              updates.history_id = newHistoryId
                            }
                            updateLlmConversation(conversation.id, updates)
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteLlmConversation(conversation.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Button onClick={fetchData}>Refresh Data</Button>
      </div>
    </div>
  )
}