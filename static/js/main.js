let numbersA = [];
let lastNumber = '';
let currentIndex = 0;
let intervalID;
let incorrectStreak = 0;
function setParameters() {
    const level = document.getElementById('level').value;
    let interval, num_per, digitnum;
    if (level === '1') {
        interval = 2;
        num_per = 2;
        digitnum = 1;
    } else if (level === '2') {
        interval = 1.5;
        num_per = 3;
        digitnum = 1;
    } else if (level === '3') {
        interval = 1;
        num_per = 4;
        digitnum = 1;
    }else if (level === '4') {
        interval = 0.8;
        num_per = 5;
        digitnum = 2;
    }else if (level === '5') {
        interval = 0.5;
        num_per = 6;
        digitnum = 3;
    }
    document.getElementById('interval').value = interval;
    document.getElementById('num_per').value = num_per;
    document.getElementById('digitnum').value = digitnum;
}

function startRecording() {
    document.getElementById('central_number').classList.remove('islast');
    document.getElementById('central_number').innerText = '中央数字';
    const interval = parseFloat(document.getElementById('interval').value);
    const num_per = document.getElementById('num_per').value;
    const digitnum = document.getElementById('digitnum').value;

    fetch('/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            interval: interval,
            num_per: num_per,
            digitnum: digitnum
        }),
    })
    .then(response => response.json())
    .then(data => {
        numbersA = data.numbers_a;
        currentIndex = 0;
        updateButtons(false);
        showNextNumber();
        intervalID = setInterval(showNextNumber, interval * 1000);
    });
}

function showNextNumber() {
    if (currentIndex < numbersA.length) {
        document.getElementById('central_number').innerText = numbersA[currentIndex];
        currentIndex++;
    } else {
        clearInterval(intervalID);
        fetch('/last_number', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            lastNumber = data.last_number;
            document.getElementById('central_number').innerText = lastNumber;
            document.getElementById('central_number').classList.add('islast');
            updateButtons(true);
        });
    }
}

function submitResponse(response) {
    fetch('/record', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            last_number: lastNumber,
            response: response
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.is_true) {
            incorrectStreak = 0;
            document.getElementById('alert').innerText = '已连续错误 0/3 次';
            setParameters();
            // 自动开始下一轮
            startRecording();
        } else {
            if (incorrectStreak == 2){
                endRecording();
            }
            else {
                incorrectStreak++;
                document.getElementById('alert').innerText = '已连续错误'+ incorrectStreak + '/3次';
                setParameters();
                // 自动开始下一轮
                startRecording();
            }   
        }
        // alert('反应时间: ' + data.reaction_time + ' 秒');
        // 随机切换Level
        // const randomLevel = Math.floor(Math.random() * 3) + 1;
        // document.getElementById('level').value = randomLevel;

    });
}

function endRecording() {
    clearInterval(intervalID);
    incorrectStreak = 0;
    document.getElementById('central_number').innerText = '中央数字';
    document.getElementById('alert').innerText = '已连续错误 0/3 次';
    updateButtons(false);
}

function updateButtons(active) {
    if (active) {
        document.getElementById('yes_button').classList.remove('inactive');
        document.getElementById('no_button').classList.remove('inactive');
        document.getElementById('yes_button').classList.add('active');
        document.getElementById('no_button').classList.add('active');
    } else {
        document.getElementById('yes_button').classList.remove('active');
        document.getElementById('no_button').classList.remove('active');
        document.getElementById('yes_button').classList.add('inactive');
        document.getElementById('no_button').classList.add('inactive');
    }
}
