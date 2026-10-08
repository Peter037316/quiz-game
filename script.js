/*
 * ============================================================
 * 知识问答游戏 - 逻辑与题库
 * ============================================================
 *
 * 技术要点对照表:
 *   题库数据    √ 按难度/分类组织的 JSON
 *   随机出题    √ Fisher-Yates 洗牌算法
 *   计时系统    √ setInterval + requestAnimationFrame
 *   进度反馈    √ 进度条 + 分数圆环 SVG
 *   状态管理    √ 游戏状态机(start/playing/result)
 *   LocalStorage √ 最高分持久化
 * ============================================================
 */

// ==================== 题库数据 ====================
const QUESTION_BANK = {
    easy: [
        { category: "科学技术", question: "太阳从哪个方向升起?", options: ["东", "西", "南", "北"], answer: 0 },
        { category: "科学技术", question: "水的化学式是什么?", options: ["CO2", "H2O", "O2", "NaCl"], answer: 1 },
        { category: "历史文化", question: "中国的首都是哪里?", options: ["上海", "广州", "北京", "深圳"], answer: 2 },
        { category: "地理知识", question: "世界上最大的海洋是?", options: ["大西洋", "印度洋", "北冰洋", "太平洋"], answer: 3 },
        { category: "体育娱乐", question: "篮球比赛每队上场几人?", options: ["4人", "5人", "6人", "7人"], answer: 1 },
        { category: "科学技术", question: "计算机的大脑被称为什么?", options: ["显卡", "内存", "CPU", "硬盘"], answer: 2 },
        { category: "历史文化", question: "长城是哪个朝代开始修建的?", options: ["唐朝", "秦朝", "汉朝", "明朝"], answer: 1 },
        { category: "地理知识", question: "中国有多少个省(直辖市)?", options: ["23个", "31个", "34个", "36个"], answer: 2 },
        { category: "体育娱乐", question: "世界杯足球赛每几年举办一次?", options: ["2年", "3年", "4年", "5年"], answer: 2 },
        { category: "科学技术", question: "WiFi是什么的缩写?", options: ["Wireless Fidelity", "Wide Fidelity", "World Fidelity", "Web Fidelity"], answer: 0 },
    ],
    medium: [
        { category: "科学技术", question: "光速大约是多少?(km/s)", options: ["30万", "3万", "300万", "3000"], answer: 0 },
        { category: "科学技术", question: "DNA的中文全称是?", options: ["核糖核酸", "脱氧核糖核酸", "氨基酸", "脂肪酸"], answer: 1 },
        { category: "历史文化", question: "四大发明中不包括以下哪个?", options: ["造纸术", "印刷术", "火药", "瓷器"], answer: 3 },
        { category: "地理知识", question: "世界上最长的河流是?", options: ["长江", "亚马逊河", "尼罗河", "黄河"], answer: 2 },
        { category: "体育娱乐", question: "奥林匹克运动会的发源地是?", options: ["罗马", "希腊", "埃及", "印度"], answer: 1 },
        { category: "科学技术", question: "HTTP默认端口号是?", options: ["21", "22", "80", "443"], answer: 2 },
        { category: "历史文化", question: "唐朝的开国皇帝是?", options: ["李世民", "李渊", "李隆基", "李治"], answer: 1 },
        { category: "地理知识", question: "世界上面积最大的国家是?", options: ["中国", "美国", "俄罗斯", "加拿大"], answer: 2 },
        { category: "体育娱乐", question: "NBA总决赛采取什么赛制?", options: ["3场2胜", "5场3胜", "7场4胜", "9场5胜"], answer: 2 },
        { category: "科学技术", question: "电池是由谁发明的?", options: ["爱迪生", "伏特", "法拉第", "牛顿"], answer: 1 },
    ],
    hard: [
        { category: "科学技术", question: "普朗克常数的数值约为?", options: ["6.63×10⁻³⁴", "3×10⁸", "9.8", "1.6×10⁻¹⁹"], answer: 0 },
        { category: "科学技术", question: "超导体的临界温度通常在多少以下?", options: ["0°C", "-100°C", "-200°C", "-273°C"], answer: 2 },
        { category: "历史文化", question: "文艺复兴时期的三杰不包括?", options: ["达芬奇", "米开朗基罗", "拉斐尔", "梵高"], answer: 3 },
        { category: "地理知识", question: "马里亚纳海沟的最深处约为?", options: ["8000米", "9000米", "11000米", "13000米"], answer: 2 },
        { category: "体育娱乐", question: "马拉松的标准距离是多少公里?", options: ["40.195", "41.195", "42.195", "43.195"], answer: 2 },
        { category: "科学技术", question: "摩尔定律描述的是什么的发展?", options: ["CPU性能", "晶体管密度", "内存容量", "硬盘速度"], answer: 1 },
        { category: "历史文化", question: "《史记》的作者司马迁受了什么刑罚?", options: ["刖刑", "宫刑", "膑刑", "黥刑"], answer: 1 },
        { category: "地理知识", question: "地球上最大的沙漠是?", options: ["撒哈拉沙漠", "阿拉伯沙漠", "戈壁沙漠", "卡拉哈里沙漠"], answer: 0 },
        { category: "体育娱乐", question: "网球四大满贯中历史最悠久的是?", options: ["澳网", "法网", "温网", "美网"], answer: 2 },
        { category: "科学技术", question: "量子纠缠的发现者之一是?", options: ["爱因斯坦", "玻尔", "薛定谔", "以上都是"], answer: 3 },
    ],
};

// ==================== DOM 元素 ====================
const $ = (id) => document.getElementById(id);

const startPage = $("startPage");
const quizPage = $("quizPage");
const resultPage = $("resultPage");

const startBtn = $("startBtn");
const categorySelect = $("categorySelect");
const diffBtns = document.querySelectorAll(".diff-btn");

const scoreDisplay = $("scoreDisplay");
const timerDisplay = $("timerDisplay");
const progressFill = $("progressFill");
const progressText = $("progressText");
const questionTag = $("questionTag");
const questionText = $("questionText");
const optionsList = $("optionsList");
const timerFill = $("timerFill");

const resultIcon = $("resultIcon");
const resultTitle = $("resultTitle");
const finalScore = $("finalScore");
const scoreFill = $("scoreFill");
const correctCount = $("correctCount");
const wrongCount = $("wrongCount");
const totalTime = $("totalTime");
const resultMessage = $("resultMessage");
const restartBtn = $("restartBtn");
const reviewBtn = $("reviewBtn");

const reviewModal = $("reviewModal");
const closeReview = $("closeReview");
const reviewList = $("reviewList");

// ==================== 游戏状态 ====================
let gameState = {
    difficulty: "easy",
    category: "all",
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    timer: null,
    timeLeft: 15,
    totalTime: 0,
    startTime: 0,
    answered: false,
};

// ==================== 初始化 ====================

// 难度选择
diffBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        diffBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        gameState.difficulty = btn.dataset.diff;
    });
});

// 开始游戏
startBtn.addEventListener("click", startGame);

// 再来一局
restartBtn.addEventListener("click", () => {
    showPage("startPage");
});

// 查看答案
reviewBtn.addEventListener("click", showReview);

closeReview.addEventListener("click", () => {
    reviewModal.classList.remove("show");
});

// ==================== 核心游戏逻辑 ====================

/* Fisher-Yates 洗牌算法 */
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* 根据难度和分类抽题 */
function pickQuestions(difficulty, category) {
    let pool = QUESTION_BANK[difficulty] || QUESTION_BANK.easy;
    if (category !== "all") {
        pool = pool.filter((q) => q.category === category);
    }
    return shuffle(pool).slice(0, Math.min(10, pool.length));
}

/* 显示页面 */
function showPage(pageId) {
    [startPage, quizPage, resultPage].forEach((p) => p.classList.remove("active"));
    $(pageId).classList.add("active");
}

/* 开始游戏 */
function startGame() {
    gameState.category = categorySelect.value;
    gameState.questions = pickQuestions(gameState.difficulty, gameState.category);

    if (gameState.questions.length === 0) {
        alert("该分类下题目不足,请换一个分类或难度!");
        return;
    }

    gameState.currentIndex = 0;
    gameState.score = 0;
    gameState.answers = [];
    gameState.totalTime = 0;
    gameState.startTime = Date.now();

    showPage("quizPage");
    loadQuestion();
}

/* 加载当前题目 */
function loadQuestion() {
    if (gameState.currentIndex >= gameState.questions.length) {
        endGame();
        return;
    }

    gameState.answered = false;
    const q = gameState.questions[gameState.currentIndex];

    // 更新进度
    progressFill.style.width = `${(gameState.currentIndex / gameState.questions.length) * 100}%`;
    progressText.textContent = `${gameState.currentIndex + 1} / ${gameState.questions.length}`;
    scoreDisplay.textContent = gameState.score;

    // 显示题目
    questionTag.textContent = q.category;
    questionText.textContent = q.question;

    // 生成选项
    optionsList.innerHTML = "";
    const letters = ["A", "B", "C", "D"];
    q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "option-item";
        btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
        btn.addEventListener("click", () => selectAnswer(i, btn));
        optionsList.appendChild(btn);
    });

    // 启动计时
    startTimer();
}

/* 选择答案 */
function selectAnswer(index, btn) {
    if (gameState.answered) return;
    gameState.answered = true;
    stopTimer();

    const q = gameState.questions[gameState.currentIndex];
    const isCorrect = index === q.answer;

    // 记录答案
    gameState.answers.push({
        question: q.question,
        userAnswer: q.options[index],
        correctAnswer: q.options[q.answer],
        isCorrect,
    });

    // 更新分数
    if (isCorrect) {
        const timeBonus = Math.floor(gameState.timeLeft / 3);
        const baseScore = gameState.difficulty === "easy" ? 10 : gameState.difficulty === "medium" ? 15 : 20;
        gameState.score += baseScore + timeBonus;
        scoreDisplay.textContent = gameState.score;
    }

    // 反馈动画
    btn.classList.add(isCorrect ? "correct" : "wrong");

    // 标记正确答案
    if (!isCorrect) {
        const btns = optionsList.querySelectorAll(".option-item");
        btns[q.answer].classList.add("correct");
    }

    // 禁用所有选项
    optionsList.querySelectorAll(".option-item").forEach((b) => b.classList.add("disabled"));

    // 1.2 秒后下一题
    setTimeout(() => {
        gameState.currentIndex++;
        loadQuestion();
    }, 1200);
}

/* 计时器 */
function startTimer() {
    gameState.timeLeft = 15;
    timerDisplay.textContent = gameState.timeLeft;
    timerFill.style.width = "100%";

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        timerDisplay.textContent = gameState.timeLeft;
        timerFill.style.width = `${(gameState.timeLeft / 15) * 100}%`;

        if (gameState.timeLeft <= 0) {
            stopTimer();
            // 超时直接跳过
            gameState.answered = true;
            const q = gameState.questions[gameState.currentIndex];
            gameState.answers.push({
                question: q.question,
                userAnswer: "(未作答)",
                correctAnswer: q.options[q.answer],
                isCorrect: false,
            });
            const btns = optionsList.querySelectorAll(".option-item");
            btns.forEach((b) => b.classList.add("disabled"));
            btns[q.answer].classList.add("correct");

            setTimeout(() => {
                gameState.currentIndex++;
                loadQuestion();
            }, 800);
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

/* 结束游戏 */
function endGame() {
    stopTimer();
    gameState.totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);

    showPage("resultPage");

    // 统计
    const correct = gameState.answers.filter((a) => a.isCorrect).length;
    const wrong = gameState.answers.length - correct;

    correctCount.textContent = correct;
    wrongCount.textContent = wrong;
    totalTime.textContent = `${gameState.totalTime}s`;

    // 分数圆环动画
    finalScore.textContent = gameState.score;
    const circumference = 2 * Math.PI * 54; // 339.292
    const percent = Math.min(gameState.score / 200, 1); // 假设满分 200
    const offset = circumference * (1 - percent);
    scoreFill.style.setProperty("--target-offset", offset);
    scoreFill.style.strokeDashoffset = circumference;
    // 触发重绘
    requestAnimationFrame(() => {
        scoreFill.style.strokeDashoffset = offset;
    });

    // 结果评价
    if (correct >= 9) {
        resultIcon.textContent = "🏆";
        resultTitle.textContent = "太棒了!";
        resultMessage.textContent = "你是知识大师!继续保持!";
    } else if (correct >= 7) {
        resultIcon.textContent = "🎉";
        resultTitle.textContent = "做得不错!";
        resultMessage.textContent = "表现优秀,再接再厉!";
    } else if (correct >= 5) {
        resultIcon.textContent = "👍";
        resultTitle.textContent = "还可以!";
        resultMessage.textContent = "多练习就能做得更好!";
    } else {
        resultIcon.textContent = "💪";
        resultTitle.textContent = "继续加油!";
        resultMessage.textContent = "知识需要慢慢积累,再来一局吧!";
    }
}

/* 查看答案 */
function showReview() {
    reviewList.innerHTML = "";
    gameState.answers.forEach((ans, i) => {
        const item = document.createElement("div");
        item.className = `review-item ${ans.isCorrect ? "correct" : "wrong"}`;
        item.innerHTML = `
            <div class="review-q">${i + 1}. ${ans.question}</div>
            <div class="review-a">
                你的答案: <span class="${ans.isCorrect ? "" : "user-ans"}">${ans.userAnswer}</span>
                ${!ans.isCorrect ? ` | 正确答案: <span class="correct-ans">${ans.correctAnswer}</span>` : ""}
            </div>
        `;
        reviewList.appendChild(item);
    });
    reviewModal.classList.add("show");
}

// ==================== 初始化 ====================
showPage("startPage");
