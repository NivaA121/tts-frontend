import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://ojcibubcgglaesgkzkel.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY2lidWJjZ2dsYWVzZ2t6a2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjI5MDUsImV4cCI6MjA4MDMzODkwNX0.e9B_umfbFvs4wB2Au-aSmB3tgmMpLdsh4FxESCcDyqE"
);
