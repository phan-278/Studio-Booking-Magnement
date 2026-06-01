import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const supabaseUrl = 'https://ypzynnhhwkteeyvctsrn.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwenlubmhod2t0ZWV5dmN0c3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTQ5MzYsImV4cCI6MjA5NDg3MDkzNn0.x1BPqwQ--krkSA4fMbzpD9GtWDNZIJthbeOnm4pOZG8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
