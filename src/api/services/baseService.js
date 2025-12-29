import { supabase } from '../supabaseClient';

/**
 * Creates a service for a Supabase table with CRUD operations
 * Compatible with Base44 SDK API patterns
 */
export function createEntityService(tableName) {
  return {
    /**
     * List all records, optionally sorted
     * @param {string} sortBy - Column to sort by (prefix with - for descending)
     * @param {number} limit - Maximum number of records to return
     */
    async list(sortBy = '-created_at', limit = 100) {
      const isDescending = sortBy.startsWith('-');
      const column = isDescending ? sortBy.slice(1) : sortBy;

      // Map Base44 field names to Supabase field names
      const columnMap = {
        'created_date': 'created_at',
        'updated_date': 'updated_at'
      };
      const mappedColumn = columnMap[column] || column;

      let query = supabase
        .from(tableName)
        .select('*')
        .order(mappedColumn, { ascending: !isDescending })
        .limit(limit);

      const { data, error } = await query;
      if (error) throw error;

      return this._mapRecords(data);
    },

    /**
     * Filter records by conditions
     * @param {object} conditions - Key-value pairs to filter by
     */
    async filter(conditions) {
      let query = supabase.from(tableName).select('*');

      // Map Base44 field names
      const fieldMap = {
        'created_by': 'email',
        'created_date': 'created_at'
      };

      for (const [key, value] of Object.entries(conditions)) {
        const mappedKey = fieldMap[key] || key;
        query = query.eq(mappedKey, value);
      }

      const { data, error } = await query;
      if (error) throw error;

      return this._mapRecords(data);
    },

    /**
     * Get a single record by ID
     * @param {string} id - Record UUID
     */
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this._mapRecord(data);
    },

    /**
     * Create a new record
     * @param {object} data - Record data
     */
    async create(data) {
      // Map Base44 field names to Supabase field names
      const mappedData = this._mapInputData(data);

      const { data: created, error } = await supabase
        .from(tableName)
        .insert(mappedData)
        .select()
        .single();

      if (error) throw error;
      return this._mapRecord(created);
    },

    /**
     * Update a record
     * @param {string} id - Record UUID
     * @param {object} data - Fields to update
     */
    async update(id, data) {
      // Map Base44 field names to Supabase field names
      const mappedData = this._mapInputData(data);

      const { data: updated, error } = await supabase
        .from(tableName)
        .update(mappedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this._mapRecord(updated);
    },

    /**
     * Delete a record
     * @param {string} id - Record UUID
     */
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },

    /**
     * Map input data from Base44 format to Supabase format
     */
    _mapInputData(data) {
      const mapped = { ...data };

      // Remove Base44-specific fields that don't exist in Supabase
      delete mapped.created_by;
      delete mapped.created_date;
      delete mapped.updated_date;

      return mapped;
    },

    /**
     * Map a single record from Supabase to Base44-compatible format
     */
    _mapRecord(record) {
      if (!record) return null;
      return {
        ...record,
        // Add Base44-compatible aliases
        created_date: record.created_at,
        updated_date: record.updated_at
      };
    },

    /**
     * Map multiple records
     */
    _mapRecords(records) {
      if (!records) return [];
      return records.map(r => this._mapRecord(r));
    }
  };
}
