const test = require('node:test');
const assert = require('node:assert');
const { formatIncidentData } = require('./incident-data');


// TEST CASE 1
test('Test Case 1: formats a complete incident record correctly', () => {

    const fakeDatabase = [
        {
            incident_id: 1,
            incident_date: '2026-09-29',
            incident_time: '09:30:00',
            purok_location: 'Purok 1',
            reporting_tanod: 'Juan Dela Cruz',
            status: 'Verified'
        }
    ];

    const result = formatIncidentData(fakeDatabase);

    assert.deepStrictEqual(result, [
        {
            incident_id: 1,
            incident_date: '2026-09-29',
            incident_time: '09:30:00',
            purok_location: 'Purok 1',
            reporting_tanod: 'Juan Dela Cruz',
            status: 'Verified'
        }
    ]);
});


// TEST CASE 2
test('Test Case 2: uses reporter when reporting_tanod is missing', () => {

    const fakeDatabase = [
        {
            incident_id: 2,
            incident_date: '2026-09-28',
            incident_time: '14:15:00',
            purok_location: 'Purok 2',
            reporter: 'Pedro Santos',
            status: 'Pending'
        }
    ];

    const result = formatIncidentData(fakeDatabase);

    assert.strictEqual(
        result[0].reporting_tanod,
        'Pedro Santos'
    );

    assert.strictEqual(
        result[0].incident_id,
        2
    );

    assert.strictEqual(
        result[0].status,
        'Pending'
    );
});


// TEST CASE 3
test('Test Case 3: uses N/A when both reporting_tanod and reporter are missing', () => {

    const fakeDatabase = [
        {
            incident_id: 3,
            incident_date: '2026-09-27',
            incident_time: '18:45:00',
            purok_location: 'Boundary Area',
            status: 'Verified'
        }
    ];

    const result = formatIncidentData(fakeDatabase);

    assert.strictEqual(
        result[0].reporting_tanod,
        'N/A'
    );

    assert.strictEqual(
        result[0].incident_id,
        3
    );

    assert.strictEqual(
        result[0].purok_location,
        'Boundary Area'
    );
});