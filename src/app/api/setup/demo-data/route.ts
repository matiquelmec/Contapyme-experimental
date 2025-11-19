import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/database/databaseSimple';

/**
 * Quick setup endpoint to create demo data for second company
 * This should only be used for demo purposes
 */

const COMPANY1_ID = '8033ee69-b420-4d91-ba0e-482f46cd6fce'; // Source
const COMPANY2_ID = '9144ff7a-c530-5e82-cb1f-593f57de7fde'; // Target

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up demo data for Company 2...');

    const supabase = createSupabaseServerClient();

    // 1. Copy some journal entries
    console.log('📝 Copying journal entries...');

    // First, get a few entries from Company 1
    const { data: sourceEntries, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('company_id', COMPANY1_ID)
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching source entries:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${sourceEntries?.length || 0} source entries`);

    if (sourceEntries && sourceEntries.length > 0) {
      // Modify the entries for Company 2
      const newEntries = sourceEntries.map((entry, index) => ({
        company_id: COMPANY2_ID,
        entry_number: entry.entry_number + 1000, // Offset to avoid conflicts
        entry_date: entry.entry_date,
        description: `[Company 2] ${entry.description}`,
        reference: entry.reference,
        entry_type: entry.entry_type,
        total_debit: Math.round(entry.total_debit * 0.7), // Different amounts
        total_credit: Math.round(entry.total_credit * 0.7),
        status: entry.status,
        created_by: 'demo-setup',
        notes: `Demo data for Company 2 - ${index + 1}`,
      }));

      // Insert new entries
      const { data: insertedEntries, error: insertError } = await supabase
        .from('journal_entries')
        .insert(newEntries)
        .select();

      if (insertError) {
        console.error('❌ Error inserting entries:', insertError);
        throw insertError;
      }

      console.log(`✅ Inserted ${insertedEntries?.length || 0} journal entries for Company 2`);
    }

    // 2. Create some dummy employees for Company 2
    console.log('👥 Creating employees for Company 2...');

    const demoEmployees = [
      {
        company_id: COMPANY2_ID,
        rut: '12.345.678-9',
        first_name: 'María',
        last_name: 'González',
        email: 'maria.gonzalez@mipyme.cl',
        position: 'Gerente General',
        status: 'active',
        phone: '+56 9 8765 4321',
        address: 'Valparaíso, Chile',
        hire_date: '2024-01-15',
        birth_date: '1985-03-20',
      },
      {
        company_id: COMPANY2_ID,
        rut: '98.765.432-1',
        first_name: 'Carlos',
        last_name: 'López',
        email: 'carlos.lopez@mipyme.cl',
        position: 'Contador',
        status: 'active',
        phone: '+56 9 7654 3210',
        address: 'Viña del Mar, Chile',
        hire_date: '2024-02-01',
        birth_date: '1990-08-15',
      },
      {
        company_id: COMPANY2_ID,
        rut: '11.222.333-4',
        first_name: 'Ana',
        last_name: 'Silva',
        email: 'ana.silva@mipyme.cl',
        position: 'Asistente Administrativa',
        status: 'active',
        phone: '+56 9 6543 2109',
        address: 'Valparaíso, Chile',
        hire_date: '2024-03-01',
        birth_date: '1992-12-10',
      },
    ];

    const { data: insertedEmployees, error: employeeError } = await supabase
      .from('employees')
      .insert(demoEmployees)
      .select();

    if (employeeError) {
      console.error('❌ Error creating employees:', employeeError);
      throw employeeError;
    }

    console.log(`✅ Created ${insertedEmployees?.length || 0} employees for Company 2`);

    return NextResponse.json({
      success: true,
      message: 'Demo data setup completed successfully',
      data: {
        company2_id: COMPANY2_ID,
        journal_entries_created: insertedEntries?.length || 0,
        employees_created: insertedEmployees?.length || 0,
      },
    });

  } catch (error) {
    console.error('💥 Setup failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Failed to set up demo data for Company 2',
    }, { status: 500 });
  }
}
