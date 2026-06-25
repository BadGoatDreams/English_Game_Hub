// ============================================================
// ESL Classroom Tool - Core Logic
// Dependencies: classroom-data.js (must be loaded before this script)
// ============================================================

const ClassroomTool = {

    // ---- State ----
    mode: 'silly',       // 'silly' | 'serious'
    level: 'intermediate',      // 'elementary' | 'basic' | 'intermediate' | 'advanced'
    tab: 'convo',        // 'convo' | 'topics' | 'wyr' | 'twisters' | 'scramble' | 'wotd' | 'taboo' | 'scenarios' | 'new-class-tool'
    timerSeconds: 0,
    timerInterval: null,
    timerRunning: false,

    // Pre-selected random indices for stability during a session
    _preSelected: {
        silly: null,
        serious: null,
        wyr: null,
        twister: null,
        scramble: null,
        wordTaboo: null,
        topic: null,
        scenario: null,
        wotd: null
    },

    // ---- Initialization ----

    init() {
        this.selectAll();
        this.bindTabs();
        this.bindButtons();
        this.loadSavedSettings();
        this.renderAll();
        this.setupSettingsListeners();
    },

    // ---- Random Selectors (Stable) ----

    randomPick(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    },

    selectQuestionSilly() {
        const pool = (data.questions.silly[this.level] && data.questions.silly[this.level].length > 0)
            ? data.questions.silly[this.level]
            : data.questions.silly.basic;
        this._preSelected.silly = this.randomPick(pool);
        return this._preSelected.silly;
    },

    selectQuestionSerious() {
        const pool = (data.questions.serious[this.level] && data.questions.serious[this.level].length > 0)
            ? data.questions.serious[this.level]
            : data.questions.serious.basic;
        this._preSelected.serious = this.randomPick(pool);
        return this._preSelected.serious;
    },

    selectTopic() {
        const pool = (data.topics[this.level] && data.topics[this.level].length > 0)
            ? data.topics[this.level]
            : data.topics.basic;
        this._preSelected.topic = this.randomPick(pool);
        return this._preSelected.topic;
    },

    selectWYR() {
        const pool = (data.wyr[this.level] && data.wyr[this.level].length > 0)
            ? data.wyr[this.level]
            : data.wyr.basic;
        this._preSelected.wyr = this.randomPick(pool);
        return this._preSelected.wyr;
    },

    selectTwister() {
        this._preSelected.twister = this.randomPick(data.twisters);
        return this._preSelected.twister;
    },

    selectScramble() {
        const pool = (data.scramble[this.level] && data.scramble[this.level].length > 0)
            ? data.scramble[this.level]
            : data.scramble.basic;
        this._preSelected.scramble = this.randomPick(pool);
        return this._preSelected.scramble;
    },

    selectWOTD() {
        const pool = (data.wotd[this.level] && data.wotd[this.level].length > 0)
            ? data.wotd[this.level]
            : data.wotd.basic;
        this._preSelected.wotd = this.randomPick(pool);
        return this._preSelected.wotd;
    },

    selectTabooWord() {
        this._preSelected.wordTaboo = this.randomPick(data.taboo);
        return this._preSelected.wordTaboo;
    },

    selectScenario() {
        const allScenarios = [];
        for (const cat in data.scenarios) {
            for (const s of data.scenarios[cat]) {
                allScenarios.push(s);
            }
        }
        this._preSelected.scenario = this.randomPick(allScenarios);
        return this._preSelected.scenario;
    },

    selectAll() {
        this.selectQuestionSilly();
        this.selectQuestionSerious();
        this.selectTopic();
        this.selectWYR();
        this.selectTwister();
        this.selectScramble();
        this.selectWOTD();
        this.selectTabooWord();
        this.selectScenario();
    },

    // ---- Rendering ----

    renderAll() {
        this.renderQuestion();
        this.renderTopicDisplay();
        this.renderWYR();
        this.renderTwister();
        this.renderScramble();
        this.renderWOTD();
        this.renderTaboo();
        this.renderScenario();
        this.updateModeButtons();
        this.updateLevelButtons();
        this.updateTabButtons();
        this.renderTimer();
        this.renderSettingsPanel();
    },

    // -- Question (Convo tab) --
    renderQuestion() {
        const el = document.getElementById('questionDisplay');
        const typeLabel = document.getElementById('questionTypeLabel');
        if (!el) return;

        let question = '';
        let label = '';

        if (this.mode === 'silly') {
            question = this._preSelected.silly || this.selectQuestionSilly();
            label = 'Silly Question';
            typeLabel.textContent = 'SILLY';
            typeLabel.className = 'question-type-label silly';
        } else {
            question = this._preSelected.serious || this.selectQuestionSerious();
            label = 'Serious Question';
            typeLabel.textContent = 'SERIOUS';
            typeLabel.className = 'question-type-label serious';
        }

        el.textContent = question;
    },

    // -- Topics Tab --
    renderTopicDisplay() {
        const el = document.getElementById('topicDisplay');
        if (!el) return;
        const topic = this._preSelected.topic || this.selectTopic();
        el.textContent = topic;
    },

    // -- Would You Rather Tab --
    renderWYR() {
        const el = document.getElementById('wyrDisplay');
        if (!el) return;
        const wyr = this._preSelected.wyr || this.selectWYR();
        el.textContent = wyr;
    },

    // -- Tongue Twisters Tab --
    renderTwister() {
        const el = document.getElementById('twisterDisplay');
        if (!el) return;
        const twister = this._preSelected.twister || this.selectTwister();
        el.textContent = twister;
    },

    // -- Word Scramble Tab --
    renderScramble() {
        const wordEl = document.getElementById('scrambleWord');
        const inputEl = document.getElementById('scrambleInput');
        const feedbackEl = document.getElementById('scrambleFeedback');
        if (!wordEl) return;

        const word = this._preSelected.scramble || this.selectScramble();
        const scrambled = this.scrambleWord(word);
        wordEl.textContent = scrambled;
        wordEl.dataset.answer = word.toUpperCase();
        if (inputEl) inputEl.value = '';
        if (feedbackEl) {
            feedbackEl.textContent = '';
            feedbackEl.className = 'scramble-feedback';
        }
    },

    scrambleWord(word) {
        const letters = word.split('');
        // Fisher-Yates shuffle
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        // Make sure it's not the same as original (for words > 2 letters)
        if (letters.join('') === word && word.length > 2) {
            // Swap first two
            [letters[0], letters[1]] = [letters[1], letters[0]];
        }
        return letters.join(' ');
    },

    checkScramble() {
        const inputEl = document.getElementById('scrambleInput');
        const wordEl = document.getElementById('scrambleWord');
        const feedbackEl = document.getElementById('scrambleFeedback');
        if (!inputEl || !wordEl || !feedbackEl) return;

        const userAnswer = inputEl.value.trim().toUpperCase();
        const correctAnswer = wordEl.dataset.answer;

        if (userAnswer === correctAnswer) {
            feedbackEl.textContent = 'Correct! Well done!';
            feedbackEl.className = 'scramble-feedback correct';
        } else if (userAnswer === '') {
            feedbackEl.textContent = 'Type your answer above.';
            feedbackEl.className = 'scramble-feedback';
        } else {
            feedbackEl.textContent = 'Not quite. Try again!';
            feedbackEl.className = 'scramble-feedback incorrect';
        }
    },

    // -- Word of the Day Tab --
    renderWOTD() {
        const el = document.getElementById('wotdDisplay');
        if (!el) return;
        const wotd = this._preSelected.wotd || this.selectWOTD();
        el.textContent = wotd;
    },

    // -- Taboo Tab --
    renderTaboo() {
        const wordEl = document.getElementById('tabooWord');
        const forbiddenEl = document.getElementById('tabooForbidden');
        if (!wordEl || !forbiddenEl) return;

        const tabooData = this._preSelected.wordTaboo || this.selectTabooWord();
        wordEl.textContent = tabooData.word;
        forbiddenEl.textContent = tabooData.forbidden.join(', ');
    },

    // -- Role Play Scenarios Tab --
    renderScenario() {
        const rolesEl = document.getElementById('scenarioRoles');
        const textEl = document.getElementById('scenarioText');
        if (!rolesEl || !textEl) return;

        const scenario = this._preSelected.scenario || this.selectScenario();
        rolesEl.textContent = scenario.roles;
        textEl.textContent = scenario.text;
    },

    // -- Timer --
    renderTimer() {
        const el = document.getElementById('timerDisplay');
        if (!el) return;
        const mins = Math.floor(this.timerSeconds / 60);
        const secs = this.timerSeconds % 60;
        el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    // -- Settings Panel --
    renderSettingsPanel() {
        // Level
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) levelSelect.value = this.level;
        // Show/hide new-class-tool tab based on level
        const newClassTab = document.querySelector('[data-tab="new-class-tool"]');
        if (newClassTab) {
            newClassTab.style.display = (this.level === 'elementary') ? 'inline-block' : 'none';
        }
    },

    // ---- Mode/Level/Tab Switching ----

    setMode(mode) {
        if (mode === this.mode) return;
        this.mode = mode;
        this.renderQuestion();
        this.updateModeButtons();
    },

    setLevel(level) {
        if (level === this.level) return;
        this.level = level;
        this.selectAll();
        this.renderAll();
    },

    setTab(tab) {
        this.tab = tab;
        this.updateTabButtons();
        this.showTabContent(tab);
    },

    updateModeButtons() {
        const sillyBtn = document.getElementById('modeSilly');
        const seriousBtn = document.getElementById('modeSerious');
        if (sillyBtn) {
            sillyBtn.classList.toggle('active', this.mode === 'silly');
        }
        if (seriousBtn) {
            seriousBtn.classList.toggle('active', this.mode === 'serious');
        }
    },

    updateLevelButtons() {
        const levels = ['elementary', 'basic', 'intermediate', 'advanced'];
        levels.forEach(l => {
            const btn = document.getElementById('level' + l.charAt(0).toUpperCase() + l.slice(1));
            if (btn) {
                btn.classList.toggle('active', this.level === l);
            }
        });
    },

    updateTabButtons() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.tab);
        });
    },

    showTabContent(tab) {
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(panel => {
            panel.classList.toggle('active', panel.id === 'panel-' + tab);
        });
    },

    // ---- Timer Functions ----

    setTimerQuick(seconds) {
        this.stopTimer();
        this.timerSeconds = seconds;
        this.renderTimer();
    },

    toggleTimer() {
        if (this.timerRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    },

    startTimer() {
        if (this.timerRunning) return;
        if (this.timerSeconds <= 0) {
            // Default to 60 seconds if not set
            this.timerSeconds = 60;
        }
        this.timerRunning = true;
        const startBtn = document.getElementById('timerToggle');
        if (startBtn) startBtn.textContent = '⏸ Stop';
        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            this.renderTimer();
            if (this.timerSeconds <= 0) {
                this.stopTimer();
                this.onTimerEnd();
            }
        }, 1000);
    },

    stopTimer() {
        this.timerRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        const startBtn = document.getElementById('timerToggle');
        if (startBtn) startBtn.textContent = '▶ Start';
    },

    onTimerEnd() {
        // Play a simple beep or flash
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.classList.add('timer-flash');
            setTimeout(() => timerDisplay.classList.remove('timer-flash'), 1000);
        }
        // Try to play audio beep
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) {
            // Audio not available, ignore
        }
    },

    // ---- Settings Persistence (localStorage) ----

    loadSavedSettings() {
        try {
            const saved = localStorage.getItem('classroomSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.level && ['elementary', 'basic', 'intermediate', 'advanced'].includes(settings.level)) {
                    this.level = settings.level;
                }
            }
        } catch(e) {
            // Ignore
        }
    },

    saveSettings() {
        try {
            localStorage.setItem('classroomSettings', JSON.stringify({
                level: this.level
            }));
        } catch(e) {
            // Ignore
        }
    },

    setupSettingsListeners() {
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.addEventListener('change', (e) => {
                this.setLevel(e.target.value);
                this.saveSettings();
            });
        }
    },

    // ---- Button Bindings ----

    bindTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTab(btn.dataset.tab);
            });
        });
    },

    bindButtons() {
        // Mode buttons
        const sillyBtn = document.getElementById('modeSilly');
        const seriousBtn = document.getElementById('modeSerious');
        if (sillyBtn) sillyBtn.addEventListener('click', () => this.setMode('silly'));
        if (seriousBtn) seriousBtn.addEventListener('click', () => this.setMode('serious'));

        // Level buttons
        const levels = ['elementary', 'basic', 'intermediate', 'advanced'];
        levels.forEach(l => {
            const btn = document.getElementById('level' + l.charAt(0).toUpperCase() + l.slice(1));
            if (btn) {
                btn.addEventListener('click', () => {
                    this.setLevel(l);
                    this.saveSettings();
                });
            }
        });

        // Next/New/Random buttons
        const newQBtn = document.getElementById('newQuestionBtn');
        if (newQBtn) newQBtn.addEventListener('click', () => {
            this.selectAll();
            this.renderAll();
        });

        const newTopicBtn = document.getElementById('newTopicBtn');
        if (newTopicBtn) newTopicBtn.addEventListener('click', () => {
            this.selectTopic();
            this.renderTopicDisplay();
        });

        const newWYRBtn = document.getElementById('newWYRBtn');
        if (newWYRBtn) newWYRBtn.addEventListener('click', () => {
            this.selectWYR();
            this.renderWYR();
        });

        const newTwisterBtn = document.getElementById('newTwisterBtn');
        if (newTwisterBtn) newTwisterBtn.addEventListener('click', () => {
            this.selectTwister();
            this.renderTwister();
        });

        const newScrambleBtn = document.getElementById('newScrambleBtn');
        if (newScrambleBtn) newScrambleBtn.addEventListener('click', () => {
            this.selectScramble();
            this.renderScramble();
        });

        const newWOTDBtn = document.getElementById('newWOTDBtn');
        if (newWOTDBtn) newWOTDBtn.addEventListener('click', () => {
            this.selectWOTD();
            this.renderWOTD();
        });

        const newTabooBtn = document.getElementById('newTabooBtn');
        if (newTabooBtn) newTabooBtn.addEventListener('click', () => {
            this.selectTabooWord();
            this.renderTaboo();
        });

        const newScenarioBtn = document.getElementById('newScenarioBtn');
        if (newScenarioBtn) newScenarioBtn.addEventListener('click', () => {
            this.selectScenario();
            this.renderScenario();
        });

        // Scramble check button
        const checkScrambleBtn = document.getElementById('checkScrambleBtn');
        if (checkScrambleBtn) checkScrambleBtn.addEventListener('click', () => this.checkScramble());

        // Scramble enter key support
        const scrambleInput = document.getElementById('scrambleInput');
        if (scrambleInput) {
            scrambleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.checkScramble();
            });
        }

        // Timer buttons
        document.querySelectorAll('.timer-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const sec = parseInt(btn.dataset.seconds, 10);
                if (!isNaN(sec)) this.setTimerQuick(sec);
            });
        });

        const timerToggle = document.getElementById('timerToggle');
        if (timerToggle) timerToggle.addEventListener('click', () => this.toggleTimer());

        const timerReset = document.getElementById('timerReset');
        if (timerReset) timerReset.addEventListener('click', () => {
            this.stopTimer();
            this.timerSeconds = 0;
            this.renderTimer();
        });

        // Custom timer input
        const customTimerBtn = document.getElementById('customTimerBtn');
        if (customTimerBtn) {
            customTimerBtn.addEventListener('click', () => {
                const input = document.getElementById('customTimerInput');
                if (input) {
                    const mins = parseFloat(input.value);
                    if (!isNaN(mins) && mins > 0) {
                        this.setTimerQuick(Math.round(mins * 60));
                    }
                }
            });
        }

        // Settings
        const settingsToggle = document.getElementById('settingsToggle');
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsToggle && settingsPanel) {
            settingsToggle.addEventListener('click', () => {
                settingsPanel.classList.toggle('open');
            });
        }
    }
};

// ---- Auto-init on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
    ClassroomTool.init();
});