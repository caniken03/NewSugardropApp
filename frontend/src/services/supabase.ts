import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          daily_sugar_goal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          daily_sugar_goal?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          daily_sugar_goal?: number;
          created_at?: string;
        };
      };
      food_entries: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sugar_content: number;
          portion_size: number;
          calories: number | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          sugar_content: number;
          portion_size: number;
          calories?: number | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          sugar_content?: number;
          portion_size?: number;
          calories?: number | null;
          timestamp?: string;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          response: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          response: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          response?: string;
          timestamp?: string;
        };
      };
    };
  };
}

export type FoodEntry = Database['public']['Tables']['food_entries']['Row'];
export type FoodEntryInsert = Database['public']['Tables']['food_entries']['Insert'];
export type ChatHistory = Database['public']['Tables']['chat_history']['Row'];