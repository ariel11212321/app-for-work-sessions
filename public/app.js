const startBtn = document.getElementById('startBtn');
const endBtn = document.getElementById('endBtn');
const timerDisplay = document.getElementById('timer');
const workSessionsList = document.getElementById('workSessionsList');

let startTime;
let timerInterval;
let running = false;

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    running = true;

}

function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}



async function stopTimer() {
    if (!running) {
        return;
    }

    const currentTime = Date.now();
    const confirmEndWork = confirm("Are you sure you want to end work?");

    if (confirmEndWork) {
        running = false;
        clearInterval(timerInterval);


        const elapsedTime = currentTime - startTime;

        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

        const data = {
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(currentTime).toISOString(),
            duration: `${hours}:${minutes}:${seconds}`
        };

        // Send an HTTP POST request to the backend with the data
        try {
            const response = await fetch('/work-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            console.log(await response.json());

            // After stopping the timer and saving the data, refresh the list of work sessions
            displayWorkSessions();
        } catch (error) {
            console.error('Error saving data to the server:', error);
        }
    }
}

startBtn.addEventListener('click', () => {
    if (!running) {
        startTimer();
    } else {
        alert("You already started to work.");
    }
});





endBtn.addEventListener('click', () => {
    if (running) {
        stopTimer();
    }
});

async function displayWorkSessions() {
    try {
        const response = await fetch('/work-sessions');
        const data = await response.json();

        // Clear the previous list
        workSessionsList.innerHTML = '';

        // Iterate through the fetched data and create list items
        data.forEach((session) => {
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);

            const listItem = document.createElement('li');
            listItem.innerHTML = `Start Date: ${formatDate(startTime)}, Start Time: ${formatTime(startTime)}, ` +
                `End Date: ${formatDate(endTime)}, End Time: ${formatTime(endTime)}, Duration: ${formatDuration(session.duration)}`;
            workSessionsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching work sessions data:', error);
    }
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
function formatDuration(duration) {
    // Split the "hh:mm:ss" formatted duration into hours, minutes, and seconds
    const [hours, minutes, seconds] = duration.split(':').map(Number);

    let formattedDuration = '';
    if (hours > 0) {
        formattedDuration += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }

    if (minutes > 0) {
        if (formattedDuration.length > 0) {
            formattedDuration += ', ';
        }
        formattedDuration += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }

    if (seconds > 0) {
        if (formattedDuration.length > 0) {
            formattedDuration += ', ';
        }
        formattedDuration += `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    }

    return formattedDuration;
}
// Call the function to fetch and display work session data when the page loads
displayWorkSessions();
