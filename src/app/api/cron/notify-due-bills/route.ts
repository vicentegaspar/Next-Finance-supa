import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { Database } from '@/types/supabase'

export const dynamic = 'force-dynamic'

// Ensure web-push is configured
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@clarix.local',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function GET(req: NextRequest) {
  try {
    // Basic API Key protection (ideal for Vercel Cron or GitHub Actions)
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev_cron_secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Supabase Admin client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseServiceKey) {
      console.warn('MISSING SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    // Tomorrow's date string (YYYY-MM-DD)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    // 1. Fetch pending expenses due tomorrow
    const { data: bills, error: billsError } = await supabase
      .from('transactions')
      .select('id, description, amount, workspace_id')
      .eq('type', 'expense')
      .eq('status', 'pending')
      .eq('date', dateStr)

    if (billsError) throw billsError

    if (!bills || bills.length === 0) {
      return NextResponse.json({ message: 'No bills due tomorrow', pushed: 0 })
    }

    let pushCount = 0

    // 2. Map bills to users efficiently
    // Group bills by Workspace to avoid duplicate user lookups
    const billsByWorkspace = bills.reduce((acc, bill) => {
      const wid = bill.workspace_id || 'unknown'
      if (!acc[wid]) acc[wid] = []
      acc[wid].push(bill)
      return acc
    }, {} as Record<string, typeof bills>)

    for (const [workspaceId, workspaceBills] of Object.entries(billsByWorkspace)) {
      if (workspaceId === 'unknown') continue

      // Find users associated with this workspace
      const { data: usersData } = await supabase
        .from('workspace_users')
        .select('user_id')
        .eq('workspace_id', workspaceId)

      if (!usersData || usersData.length === 0) continue

      const userIds = usersData.map(u => u.user_id)

      // Get ALL valid push subscriptions for these users
      const { data: subscriptions } = await (supabase as any)
        .from('push_subscriptions')
        .select('*')
        .in('user_id', userIds)

      if (!subscriptions) continue

      // For this workspace, craft a summarized payload or individual payloads
      // Example: "You have 2 bills due tomorrow totaling R$ 100.00"
      const totalAmount = workspaceBills.reduce((sum, b) => sum + Number(b.amount), 0)
      const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)
      
      const payload = {
        title: 'Contas a Vencer Amanhã! 💸',
        body: workspaceBills.length === 1 
          ? `Sua conta "${workspaceBills[0].description}" de ${formattedTotal} vence amanhã.`
          : `Você tem ${workspaceBills.length} contas vencendo amanhã. Total: ${formattedTotal}.`,
        url: '/transactions'
      }

      // Send to all endpoints
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            JSON.stringify(payload)
          )
          pushCount++
        } catch (error: any) {
          console.error(`Error sending push to ${sub.endpoint}:`, error)
          // If the endpoint is expired/invalid (410), we should delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await (supabase as any).from('push_subscriptions').delete().eq('id', sub.id)
          }
        }
      }
    }

    return NextResponse.json({ message: 'Evaluated pending bills', pushed: pushCount })
  } catch (error: any) {
    console.error('CRON Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
