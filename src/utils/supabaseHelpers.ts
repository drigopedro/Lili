import { supabase } from '../lib/supabase';

/**
 * A helper function to safely get a single record from a table
 * Uses maybeSingle() to avoid 406 errors when no record exists
 */
export async function getUserRecord<T>(
  tableName: string, 
  userId: string, 
  select: string = '*'
): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Failed to get user record from ${tableName}:`, error);
    throw error;
  }
}

/**
 * A helper function to create a record if it doesn't exist
 */
export async function createIfNotExists<T>(
  tableName: string,
  record: any,
  uniqueField: string = 'user_id'
): Promise<T> {
  try {
    // First check if record exists
    const { data: existingRecord, error: checkError } = await supabase
      .from(tableName)
      .select('*')
      .eq(uniqueField, record[uniqueField])
      .maybeSingle();

    if (checkError) throw checkError;
    
    // If record exists, return it
    if (existingRecord) {
      return existingRecord as T;
    }
    
    // Otherwise create a new record
    const { data, error } = await supabase
      .from(tableName)
      .insert(record)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as T;
  } catch (error) {
    console.error(`Error in createIfNotExists for ${tableName}:`, error);
    throw error;
  }
}

/**
 * A helper function to safely update a record
 * Uses upsert to handle the case where the record doesn't exist
 */
export async function updateUserRecord<T>(
  tableName: string,
  userId: string,
  updates: any,
  uniqueField: string = 'user_id'
): Promise<T> {
  try {
    // Prepare the record with the unique field
    const record = {
      ...updates,
      [uniqueField]: userId,
      updated_at: new Date().toISOString()
    };
    
    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from(tableName)
      .upsert(record, { onConflict: uniqueField })
      .select()
      .single();
      
    if (error) throw error;
    
    return data as T;
  } catch (error) {
    console.error(`Error in updateUserRecord for ${tableName}:`, error);
    throw error;
  }
}

/**
 * A helper function to safely delete a record
 */
export async function deleteUserRecord(
  tableName: string,
  userId: string,
  uniqueField: string = 'user_id'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(uniqueField, userId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error in deleteUserRecord for ${tableName}:`, error);
    throw error;
  }
}

/**
 * A helper function to handle database errors
 */
export function handleDatabaseError(error: any, defaultMessage: string = 'Database operation failed'): string {
  if (!error) return defaultMessage;
  
  // Handle specific error codes
  if (error.code === '23505') {
    return 'A record with this information already exists';
  }
  
  if (error.code === '23503') {
    return 'This operation references a record that does not exist';
  }
  
  if (error.code === 'PGRST116') {
    return 'No records found';
  }
  
  // Return the error message or default message
  return error.message || defaultMessage;
}