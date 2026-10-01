async function createPatrolAssignment(e) {
    e.preventDefault();

    const payload = getPatrolFormData();

    const errorMessage = validatePatrolFormData(payload);

    if (errorMessage) {
        showNotification(errorMessage, 'error');
        return;
    }

    await submitPatrolAssignment(payload);
}


function getPatrolFormData() {
    return {
        squad_leader: document.getElementById('patrol_leader').value,
        purok_location: document.getElementById('patrol_location').value,
        shift_assignment: document.getElementById('patrol_shift').value,
        deployment_date: document.getElementById('patrol_date').value
    };
}


function validatePatrolFormData(payload) {
    if (!payload.squad_leader) {
        return 'Please select a valid Squad Leader before authorizing deployment.';
    }

    return null;
}


async function submitPatrolAssignment(payload) {
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
        console.error(
            "Network error on deployment form intercept:",
            err
        );

        showNotification(
            'Network connection error. Server is completely unreachable.',
            'error'
        );
    }
}

const test = require('node:test');
const assert = require('node:assert/strict');


// ============================================
// HARD-CODED TEST DATABASE
// ============================================

const patrolDatabase = [];


// ============================================
// REFACTORED FUNCTIONS
// ============================================

async function createPatrolAssignment(e) {
    e.preventDefault();

    const payload = getPatrolFormData();

    const errorMessage = validatePatrolFormData(payload);

    if (errorMessage) {
        showNotification(errorMessage, 'error');
        return;
    }

    await submitPatrolAssignment(payload);
}


function getPatrolFormData() {
    return {
        squad_leader: document.getElementById('patrol_leader').value,
        purok_location: document.getElementById('patrol_location').value,
        shift_assignment: document.getElementById('patrol_shift').value,
        deployment_date: document.getElementById('patrol_date').value
    };
}


function validatePatrolFormData(payload) {

    if (!payload.squad_leader) {
        return 'Please select a valid Squad Leader before authorizing deployment.';
    }

    return null;
}


async function submitPatrolAssignment(payload) {

    try {

        const response = await fetch(
            'http://localhost:5000/api/patrols',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (response.ok) {

            document.getElementById(
                'patrol_leader'
            ).selectedIndex = 0;

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
// FAKE BROWSER
// ============================================

const formData = {

    patrol_leader: {
        value: '',
        selectedIndex: 1
    },

    patrol_location: {
        value: ''
    },

    patrol_shift: {
        value: ''
    },

    patrol_date: {
        value: ''
    }
};


global.document = {

    getElementById(id) {
        return formData[id];
    }

};


global.showNotification = (message, type = 'success') => {

    console.log('Notification:', message);

};


global.loadPatrolRoster = () => {

    console.log('Roster reloaded.');

};


// ============================================
// FAKE API / DATABASE
// ============================================

global.fetch = async (url, options) => {

    const patrol = JSON.parse(options.body);

    patrolDatabase.push(patrol);

    return {
        ok: true
    };

};


// ============================================
// 3 TEST CASES
// ============================================

test('Refactored Patrol Assignment - 3 Test Cases', async () => {

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

        // Put test data into the fake form
        formData.patrol_leader.value = data.leader;
        formData.patrol_location.value = data.location;
        formData.patrol_shift.value = data.shift;
        formData.patrol_date.value = data.date;

        // Clear fake database
        patrolDatabase.length = 0;


        // Run refactored function
        await createPatrolAssignment({

            preventDefault() {}

        });


        // Get returned/saved patrol
        const result = patrolDatabase[0];


        // Check result
        const passed =
            result.squad_leader === data.leader &&
            result.purok_location === data.location &&
            result.shift_assignment === data.shift &&
            result.deployment_date === data.date;


        // ====================================
        // DISPLAY RESULT
        // ====================================

        console.log(`\nTEST ${i + 1}:`);

        console.log('  Input:');
        console.log(
            '    Squad Leader:',
            data.leader
        );

        console.log(
            '    Purok Location:',
            data.location
        );

        console.log(
            '    Shift:',
            data.shift
        );

        console.log(
            '    Deployment Date:',
            data.date
        );


        console.log('\n  Patrol returned:');

        console.log(
            `    ${result.squad_leader}, ${result.purok_location}, ${result.shift_assignment}`
        );


        console.log('\n  Expected:');

        console.log(
            `    ${data.leader}, ${data.location}, ${data.shift}`
        );


        console.log(
            `\n  Result: ${passed ? 'PASS' : 'FAIL'}`
        );


        // Make Node officially mark the test as failed
        // if the expected result is not achieved.
        assert.equal(
            passed,
            true
        );

    }

});