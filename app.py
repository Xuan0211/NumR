from flask import Flask, render_template, request, jsonify
import random
import time
import json

app = Flask(__name__)

# 初始化全局变量
numbers_a = []
numbers_b = []
start_time = 0
last_number = ''

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def start():
    global numbers_a, numbers_b, start_time
    data = request.json
    interval = (data['interval'])
    num_per = int(data['num_per'])
    digitnum = int(data['digitnum'])
    
    # 确保num_per不超过随机数的范围
    assert num_per <= (10**digitnum - 10**(digitnum-1))

    # 生成一组不重复的随机数
    unique_random_numbers = random.sample(range(10**(digitnum-1), 10**digitnum), num_per)

    # 转换为字符串格式
    numbers_a = [str(num) for num in unique_random_numbers]
    
    # 初始化B组数字
    numbers_b = []
    for _ in range(num_per):
        if random.random() < 0.5:
            numbers_b.append(random.choice(numbers_a))
        else:
            numbers_b.append(str(random.randint(10**(digitnum-1), 10**digitnum - 1)))
    
    start_time = time.time()
    
    return jsonify({'status': 'started', 'numbers_a': numbers_a})

@app.route('/last_number', methods=['POST'])
def last_number():
    global last_number, start_time
    last_number = random.choice(numbers_b)
    start_time = time.time()
    return jsonify({'last_number': last_number})

@app.route('/record', methods=['POST'])
def record():
    global start_time, last_number
    data = request.json
    response = data['response']
    end_time = time.time()
    reaction_time = end_time - start_time
    pre="YES" if last_number in numbers_a else "NO"
    is_true=pre==response
    record_data = {
        'numbers_a': numbers_a,
        'last_number': last_number,
        'response': response,
        'is_true':is_true,
        'reaction_time': reaction_time
    }
    
    with open('records.txt', 'a') as f:
        f.write(json.dumps(record_data) + '\n')
    
    return jsonify({'status': 'recorded', 'reaction_time': reaction_time, "is_true": is_true})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=21000)
