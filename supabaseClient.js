import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxueeprixycxsqyzdmqk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dWVlcHJpeHljeHNxeXpkbXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzA3MTksImV4cCI6MjA1ODA0NjcxOX0.-qg4b3IpoNFfoE_hq1dcFoiIiEQhctrFkGDMvvyq87c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const getPublicImageUrl = (path) => {
    return `${supabaseUrl}/storage/v1/object/public/${path}`;
};
