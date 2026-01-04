import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// NOTE: in production, use process.env.VAPID_PUBLIC_KEY etc.
const vapidKeys = {
    publicKey: 'BAmy3kdkAk5kcwoh_Fjfj6iky7R6OeEqjH5aBeXe1AVmDN6QFRmNbG7EThDmlq8CAOcefkUXw51U5h88iRM-8pk',
    privateKey: 'jE9H_vrnLAxJUV8ZPosIrTiB1xw7Rawu6tpKnTyS10I'
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ejtctmjfvdvzmebkayfz.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'REPLACE_WITH_SUPABASE_KEY'; // backend needs service role or properly configured RLS, but for simple poke insert anon might work if RLS allows authenticated insert
// Actually for sending push, we need to fetch receiver's sub.
// RLS allows 'select' for authenticated? "Public profiles are viewable by everyone." Yes.

const supabase = createClient(supabaseUrl, supabaseKey);

webpush.setVapidDetails(
    'mailto:test@example.com', // Updated to a slightly more realistic placeholder, though user should replace in prod
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { sender_id, receiver_id, message } = req.body;

    if (!sender_id || !receiver_id) {
        return res.status(400).json({ error: 'Missing sender_id or receiver_id' });
    }

    // 1. Insert Poke into DB
    const { error: dbError } = await supabase
        .from('pokes')
        .insert({ sender_id, receiver_id, message: message || 'Lets go!' });

    if (dbError) {
        return res.status(500).json({ error: dbError.message });
    }

    // 2. Fetch Receiver's Push Subscription
    const { data: receiver, error: fetchError } = await supabase
        .from('profiles')
        .select('push_subscription')
        .eq('id', receiver_id)
        .single();

    if (fetchError || !receiver?.push_subscription) {
        // User hasn't subscribed or error, but poke is saved.
        return res.status(200).json({ message: 'Poke saved, but no push subscription found.' });
    }

    // 3. Send Web Push
    try {
        const payload = JSON.stringify({
            title: 'New Poke!',
            body: `Someone (ID: ${sender_id.slice(0, 8)}...) poked you!`
        });

        await webpush.sendNotification(receiver.push_subscription, payload);
        return res.status(200).json({ message: 'Poke sent and notification delivered.' });
    } catch (error) {
        console.error('Error sending push:', error);
        return res.status(500).json({ error: 'Failed to send notification' });
    }
}
