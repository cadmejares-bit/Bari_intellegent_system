const test = require('node:test');
const assert = require('node:assert/strict');

// ============================================
// HARD-CODED TEST DATABASE
// ============================================

const patrolDatabase = [];


// ============================================
// ORIGINAL FUNCTION
// ============================================

async function createPatrolAssignment(e) {
    e.preventDefault();

    const payload = {
        squad_leader: document.getElementById('patrol_leader').value,
        purok_location: document.getElementById('patrol_location').value,
        shift_assignment: document.getElementById('patrol_shift').value,
        deployment_date: document.getElementById('patrol_date').value
    };

    if (!payload.squad_leader) {
        showNotification(
            'Please select a valid Squad Leader before authorizing deployment.',
            'error'
        );
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/patrols', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('patrol_leader').selectedIndex = 0;
            loadPatrolRoster();

            showNotification(
                'Squad structure authorized and successfully deployed to the field.'
            );
        } else {
            showNotification(
                'Deployment dispatch rejected by server authorization logic.',
                'error'
            );
        }
    } catch (err) {
        showNotification(
            'Network connection error. Server is completely unreachable.',
            'error'
        );
    }
}


// ============================================
// FAKE DATABASE / BROWSER
// ============================================

const formData = {
    patrol_leader: {
        value: 'Juan Dela Cruz',
        selectedIndex: 1
    },

    patrol_location: {
        value: 'Purok 1'
    },

    patrol_shift: {
        value: 'Morning'
    },

    patrol_date: {
        value: '2026-09-29'
    }
};

global.document = {
    getElementById(id) {
        return formData[id];
    }
};

global.showNotification = (message, type = 'success') => {
    console.log(`Notification: ${message}`);
};

global.loadPatrolRoster = () => {
    console.log('Roster reloaded.');
};


// ============================================
// FAKE API
// ============================================

global.fetch = async (url, options) => {

    const patrol = JSON.parse(options.body);

    // Save into our hard-coded database
    patrolDatabase.push(patrol);

    return {
        ok: true
    };
};


// ============================================
// RUN TEST
// ============================================
test('Patrol Assignment Tests', async () => {

    const testCases = [
        {
            leader: 'Juan Dela Cruz',
            location: 'Purok 1',
            shift: 'Morning',
            date: '2026-09-29'
        },
        {
            leader: 'Maria Santos',
            location: 'Purok 2',
            shift: 'Afternoon',
            date: '2026-09-30'
        },
        {
            leader: 'Pedro Reyes',
            location: 'Purok 3',
            shift: 'Night',
            date: '2026-10-01'
        }
    ];

    for (let i = 0; i < testCases.length; i++) {

        const data = testCases[i];

        formData.patrol_leader.value = data.leader;
        formData.patrol_location.value = data.location;
        formData.patrol_shift.value = data.shift;
        formData.patrol_date.value = data.date;

        patrolDatabase.length = 0;

        await createPatrolAssignment({
            preventDefault() {}
        });

        const result = patrolDatabase[0];

        console.log(`\nTEST ${i + 1}:`);

        console.log('  Input:');
        console.log('    Squad Leader:', data.leader);
        console.log('    Purok Location:', data.location);
        console.log('    Shift:', data.shift);
        console.log('    Deployment Date:', data.date);

        console.log('\n  Patrol returned:');
        console.log(
            `    ${result.squad_leader}, ${result.purok_location}, ${result.shift_assignment}`
        );

        console.log('\n  Expected:');
        console.log(
            `    ${data.leader}, ${data.location}, ${data.shift}`
        );

        const passed =
            result.squad_leader === data.leader &&
            result.purok_location === data.location &&
            result.shift_assignment === data.shift &&
            result.deployment_date === data.date;

        console.log(`\n  Result: ${passed ? 'PASS' : 'FAIL'}`);

        assert.equal(passed, true);
    }
});