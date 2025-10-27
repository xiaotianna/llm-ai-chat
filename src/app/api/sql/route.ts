import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/db/supabase';

// Create a Supabase client with service role key (bypasses RLS)
const getServiceSupabase = () => {
  // Use the service role key to bypass RLS
  // This key should be stored in environment variables in production
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey!
  )
}

// GET - Fetch data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const serviceSupabase = getServiceSupabase()

    // Fetch chat histories
    const { data: chatHistories, error: chatError } = await serviceSupabase
      .from('chat_histories')
      .select('*')
      .eq('user_id', userId)
      .order('create_time', { ascending: false })

    if (chatError) {
      console.error('Chat histories fetch error:', chatError)
      return NextResponse.json({ error: chatError.message }, { status: 500 })
    }

    // Fetch llm conversations
    const { data: llmConversations, error: conversationError } =
      await serviceSupabase
        .from('llm_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('create_time', { ascending: false })

    if (conversationError) {
      console.error('LLM conversations fetch error:', conversationError)
      return NextResponse.json(
        { error: conversationError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      chatHistories,
      llmConversations
    })
  } catch (error) {
    console.error('Error in GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create data
export async function POST(request: Request) {
  try {
    const { type, data, userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      )
    }

    const serviceSupabase = getServiceSupabase()

    let result
    let error

    if (type === 'chat_history') {
      // Add user_id to the data
      const insertData = { ...data, user_id: userId }
      console.log('Inserting chat history:', insertData)

      const { data: insertedData, error: insertError } = await serviceSupabase
        .from('chat_histories')
        .insert([insertData])
        .select()

      result = insertedData
      error = insertError
    } else if (type === 'llm_conversation') {
      // Add user_id to the data
      const insertData = { ...data, user_id: userId }
      console.log('Inserting LLM conversation:', insertData)

      const { data: insertedData, error: insertError } = await serviceSupabase
        .from('llm_conversations')
        .insert([insertData])
        .select()

      result = insertedData
      error = insertError
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (error) {
      console.error(`${type} insert error:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update data
export async function PUT(request: Request) {
  try {
    const { type, id, data, userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: 'Type, ID, and data are required' },
        { status: 400 }
      )
    }

    const serviceSupabase = getServiceSupabase()

    let result
    let error

    if (type === 'chat_history') {
      const { data: updatedData, error: updateError } = await serviceSupabase
        .from('chat_histories')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()

      result = updatedData
      error = updateError
    } else if (type === 'llm_conversation') {
      const { data: updatedData, error: updateError } = await serviceSupabase
        .from('llm_conversations')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()

      result = updatedData
      error = updateError
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (error) {
      console.error(`${type} update error:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete data
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      )
    }

    const serviceSupabase = getServiceSupabase()

    let error

    if (type === 'chat_history') {
      const { error: deleteError } = await serviceSupabase
        .from('chat_histories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      error = deleteError
    } else if (type === 'llm_conversation') {
      const { error: deleteError } = await serviceSupabase
        .from('llm_conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      error = deleteError
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (error) {
      console.error(`${type} delete error:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
