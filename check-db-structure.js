const { Client } = require('pg');

async function checkDatabaseStructure() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Maty182094420.@db.yttdnmokivtayeunlvlk.supabase.co:5432/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database');

    // List all tables
    const tablesResult = await client.query(`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log('\n📋 Current Tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });

    // Check if auth schema exists (Supabase native auth)
    const authResult = await client.query(`
      SELECT schemaname
      FROM information_schema.schemata
      WHERE schemaname = 'auth';
    `);

    if (authResult.rows.length > 0) {
      console.log('\n🔐 Auth schema exists (Supabase Auth is available)');

      // Check auth tables
      const authTablesResult = await client.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'auth'
        ORDER BY tablename;
      `);

      console.log('Auth tables:');
      authTablesResult.rows.forEach(row => {
        console.log(`  - auth.${row.tablename}`);
      });
    } else {
      console.log('\n❌ Auth schema not found');
    }

    // Check companies table structure
    const companiesResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'companies' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    if (companiesResult.rows.length > 0) {
      console.log('\n🏢 Companies table structure:');
      companiesResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    // Check users table structure
    const usersResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    if (usersResult.rows.length > 0) {
      console.log('\n👥 Users table structure:');
      usersResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    // Check if RLS is enabled
    const rlsResult = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('companies', 'users')
      ORDER BY tablename;
    `);

    console.log('\n🔒 Row Level Security status:');
    rlsResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}: ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
    });

    // Sample data check
    const companiesCount = await client.query('SELECT COUNT(*) as count FROM companies;');
    const usersCount = await client.query('SELECT COUNT(*) as count FROM users;');

    console.log('\n📊 Current data:');
    console.log(`  - Companies: ${companiesCount.rows[0].count}`);
    console.log(`  - Users: ${usersCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabaseStructure();