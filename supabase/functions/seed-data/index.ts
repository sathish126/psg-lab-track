import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting sample data seed...');

    // Check if departments already exist
    const { data: existingDepts } = await supabaseClient
      .from('departments')
      .select('id')
      .limit(1);

    if (existingDepts && existingDepts.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Sample data already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Insert sample departments
    const { data: departments, error: deptError } = await supabaseClient
      .from('departments')
      .insert([
        { code: 'CSE', name: 'Computer Science & Engineering' },
        { code: 'ECE', name: 'Electronics & Communication Engineering' },
        { code: 'MECH', name: 'Mechanical Engineering' },
        { code: 'EEE', name: 'Electrical & Electronics Engineering' },
      ])
      .select();

    if (deptError) throw deptError;
    console.log('Departments created:', departments?.length);

    // Get current user (should be principal who's calling this)
    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.split('Bearer ')[1] ?? ''
    );

    if (!user) throw new Error('User not authenticated');

    // Insert sample labs
    const { data: labs, error: labError } = await supabaseClient
      .from('labs')
      .insert([
        {
          lab_code: 'CSE-LAB-01',
          name: 'Computer Networks Lab',
          block: 'A',
          hall_no: '101',
          floor: '1',
          capacity: 60,
          department_id: departments![0].id,
          in_charge_id: user.id,
        },
        {
          lab_code: 'CSE-LAB-02',
          name: 'Programming Lab',
          block: 'A',
          hall_no: '102',
          floor: '1',
          capacity: 60,
          department_id: departments![0].id,
          in_charge_id: user.id,
        },
        {
          lab_code: 'ECE-LAB-01',
          name: 'Digital Electronics Lab',
          block: 'B',
          hall_no: '201',
          floor: '2',
          capacity: 40,
          department_id: departments![1].id,
          in_charge_id: user.id,
        },
      ])
      .select();

    if (labError) throw labError;
    console.log('Labs created:', labs?.length);

    // Insert sample equipment
    const { data: equipment, error: eqError } = await supabaseClient
      .from('equipment')
      .insert([
        {
          name: 'Dell OptiPlex 7090',
          make: 'Dell',
          serial_no: 'DL-2024-001',
          model_no: 'OptiPlex 7090',
          qr_code: 'EQ-CSE-001',
          cost: 65000,
          purchase_date: '2024-01-15',
          funding_source: 'AICTE',
          stock_page_no: 'SP-001',
          stock_serial_no: 'SS-001',
          block: 'A',
          hall_no: '101',
          working_status: 'WORKING',
          physical_presence: true,
          lab_id: labs![0].id,
          faculty_in_charge_id: user.id,
          remarks: 'Brand new system for lab use',
        },
        {
          name: 'HP ProDesk 600 G6',
          make: 'HP',
          serial_no: 'HP-2024-002',
          model_no: 'ProDesk 600 G6',
          qr_code: 'EQ-CSE-002',
          cost: 58000,
          purchase_date: '2024-01-15',
          funding_source: 'AICTE',
          stock_page_no: 'SP-002',
          stock_serial_no: 'SS-002',
          block: 'A',
          hall_no: '101',
          working_status: 'WORKING',
          physical_presence: true,
          lab_id: labs![0].id,
          faculty_in_charge_id: user.id,
        },
        {
          name: 'Cisco Catalyst 2960 Switch',
          make: 'Cisco',
          serial_no: 'CS-2024-003',
          model_no: 'Catalyst 2960',
          qr_code: 'EQ-CSE-003',
          cost: 85000,
          purchase_date: '2023-08-20',
          funding_source: 'UGC',
          stock_page_no: 'SP-003',
          stock_serial_no: 'SS-003',
          block: 'A',
          hall_no: '101',
          working_status: 'REPAIRABLE',
          physical_presence: true,
          lab_id: labs![0].id,
          faculty_in_charge_id: user.id,
          remarks: 'Port 5 not responding',
        },
        {
          name: 'Tektronix Oscilloscope',
          make: 'Tektronix',
          serial_no: 'TK-2023-004',
          model_no: 'TBS2000B',
          qr_code: 'EQ-ECE-001',
          cost: 125000,
          purchase_date: '2023-06-10',
          funding_source: 'DST',
          stock_page_no: 'SP-004',
          stock_serial_no: 'SS-004',
          block: 'B',
          hall_no: '201',
          working_status: 'WORKING',
          physical_presence: true,
          lab_id: labs![2].id,
          faculty_in_charge_id: user.id,
        },
        {
          name: 'Agilent Function Generator',
          make: 'Agilent',
          serial_no: 'AG-2023-005',
          model_no: '33220A',
          qr_code: 'EQ-ECE-002',
          cost: 95000,
          purchase_date: '2023-06-10',
          funding_source: 'DST',
          stock_page_no: 'SP-005',
          stock_serial_no: 'SS-005',
          block: 'B',
          hall_no: '201',
          working_status: 'NOT_WORKING',
          physical_presence: true,
          lab_id: labs![2].id,
          faculty_in_charge_id: user.id,
          remarks: 'Display not working',
        },
      ])
      .select();

    if (eqError) throw eqError;
    console.log('Equipment created:', equipment?.length);

    // Insert sample verifications
    const { error: verifyError } = await supabaseClient
      .from('verifications')
      .insert([
        {
          equipment_id: equipment![0].id,
          verified_by_id: user.id,
          status: 'VERIFIED',
          working_status: 'WORKING',
          physical_presence: true,
          verified_at: new Date().toISOString(),
          remarks: 'All systems operational',
        },
        {
          equipment_id: equipment![1].id,
          verified_by_id: user.id,
          status: 'VERIFIED',
          working_status: 'WORKING',
          physical_presence: true,
          verified_at: new Date().toISOString(),
        },
        {
          equipment_id: equipment![2].id,
          verified_by_id: user.id,
          status: 'NEEDS_ATTENTION',
          working_status: 'REPAIRABLE',
          physical_presence: true,
          verified_at: new Date().toISOString(),
          remarks: 'Port 5 not responding, needs repair',
        },
      ]);

    if (verifyError) throw verifyError;
    console.log('Verifications created successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Sample data seeded successfully',
        counts: {
          departments: departments?.length,
          labs: labs?.length,
          equipment: equipment?.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
